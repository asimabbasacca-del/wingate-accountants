import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { FIRM_ID, type User, type UserRole } from "@/lib/tax-returns/types";
import { publicUser, readSessionUser } from "@/lib/tax-returns/session";
import { store } from "@/lib/tax-returns/store";
import { nowIso } from "@/lib/tax-returns/crypto";
import { classifyDocument } from "@/lib/tax-returns/intelligence";
import { listPackagesForAdmin, savePackageRecord, getPublishedCatalog } from "@/lib/packages/backend";
import { PACKAGES } from "@/lib/packages/data";
import type { Package } from "@/lib/packages/types";
import { can, isTaxStaff, portalHome, type Permission } from "./roles";
import { practiceStore } from "./store";
import { createPackageCheckout, markInvoicePaid } from "./stripe";
import { runPaymentAutomation } from "./automation";
import { deadlineStatus, sendDueReminders } from "./deadlines";
import { profileProgress } from "./types";
import type {
  AmlCase,
  AutomationAction,
  ClientProfile,
  CmsPage,
  DeadlineKind,
  Lead,
  LeadStatus,
  PromoCode,
} from "./types";
import { isValidEmail, sanitizeHtml } from "@/lib/security/html";
import { passwordMeetsPolicy } from "@/lib/tax-returns/crypto";
import { isProduction } from "@/lib/security/config";
import { redactMail } from "@/lib/security/mail";
import { publicError } from "@/lib/security/errors";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return json({ error: message, accessDenied: status === 403 }, status);
}

async function requireUser() {
  const user = await readSessionUser();
  if (!user) throw Object.assign(new Error("Please sign in"), { status: 401 });
  return user;
}

function deny(): never {
  throw Object.assign(new Error("Access Denied"), { status: 403 });
}

function must(user: User, permission: Permission) {
  if (!can(user.role, permission)) deny();
}

function join(path: string[]) {
  return path.filter(Boolean).join("/");
}

function emptyProfile(userId: string): ClientProfile {
  return {
    userId,
    phone: "",
    niNumber: "",
    utr: "",
    dateOfBirth: "",
    addressLine: "",
    postcode: "",
    companyName: "",
    companyNumber: "",
    vatNumber: "",
    updatedAt: nowIso(),
  };
}

export async function dispatchPractice(req: NextRequest, path: string[]): Promise<NextResponse> {
  try {
    const key = `${req.method} ${join(path)}`;
    if (key === "GET bootstrap") {
      const user = await readSessionUser();
      if (!user) return json({ user: null });
      const snap = await practiceStore.snapshot();
      const scopedJobs = user.role === "client" ? snap.jobs.filter((job) => job.clientId === user.id) : snap.jobs;
      const scopedInvoices =
        user.role === "client" ? snap.invoices.filter((row) => row.userId === user.id || row.email === user.email) : snap.invoices;
      const scopedDeadlines =
        user.role === "client" ? snap.deadlines.filter((row) => row.clientId === user.id) : snap.deadlines;
      const hideFinance = user.role === "developer" || user.role === "marketing";
      const hideClients = user.role === "marketing" || user.role === "developer";
      const profile = snap.profiles.find((row) => row.userId === user.id);
      return json({
        user: publicUser(user),
        home: portalHome(user.role),
        permissions: {
          clients: can(user.role, "clients.view"),
          payments: can(user.role, "payments.view"),
          cms: can(user.role, "cms.edit"),
          packages: can(user.role, "packages.manage"),
          users: can(user.role, "users.manage"),
          refunds: can(user.role, "payments.refund"),
          aml: can(user.role, "aml.manage"),
        },
        onboarding: profileProgress(profile),
        snapshot: {
          cms: can(user.role, "cms.edit") || can(user.role, "blog.manage") ? snap.cms : [],
          audit: can(user.role, "audit.view") ? snap.audit.slice(0, 100) : [],
          invoices: hideFinance ? [] : scopedInvoices,
          subscriptions: hideFinance ? [] : user.role === "client" ? snap.subscriptions.filter((s) => s.userId === user.id) : snap.subscriptions,
          promos: can(user.role, "pricing.manage") ? snap.promos : [],
          leads: can(user.role, "crm.manage") ? snap.leads : [],
          jobs: hideClients && user.role !== "staff" && user.role !== "accountant" ? [] : scopedJobs,
          deadlines: scopedDeadlines.map((row) => ({ ...row, status: deadlineStatus(row.dueAt, row.status) })),
          automations: can(user.role, "automation.manage") ? snap.automations : [],
          aml: hideClients ? [] : user.role === "client" ? snap.aml.filter((row) => row.clientId === user.id) : snap.aml,
          abandoned: can(user.role, "payments.view") ? snap.abandoned : [],
          refunds: can(user.role, "payments.refund") ? snap.refunds : [],
          profiles: hideClients ? [] : user.role === "client" ? snap.profiles.filter((row) => row.userId === user.id) : snap.profiles,
          settings: snap.settings,
          mail: redactMail(
            user.role === "client"
              ? await store.listMail(user.id)
              : isTaxStaff(user.role) || user.role === "developer"
                ? await store.listMail()
                : [],
            user.id,
            user.role,
          ),
          users: can(user.role, "users.manage") ? (await store.allUsers()).map((row) => publicUser(row)) : [],
        },
      });
    }

    if (key === "POST lead") {
      const body = (await req.json()) as Partial<Lead> & { name?: string; email?: string; message?: string };
      if (!body.name || !isValidEmail(body.email)) return error("Name and a valid email are required");
      const lead = await practiceStore.saveLead({
        id: `lead_${randomUUID()}`,
        firmId: FIRM_ID,
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        businessName: body.businessName || "",
        serviceInterest: body.serviceInterest || body.message || "General enquiry",
        notes: body.notes || body.message || "",
        source: body.source || "website",
        status: "new",
        ownerId: "usr_accountant",
        createdAt: nowIso(),
        activities: [{ at: nowIso(), text: "Lead captured from the website." }],
      });
      await store.addMail({
        to: lead.email,
        subject: "We have your Wingate enquiry",
        body: "Thank you. A member of the team will reply the same working day if you wrote before 3pm.",
        kind: "lead_confirm",
      });
      await practiceStore.audit("system", "website", "lead.created", `${lead.name} ${lead.email}`);
      return json({ lead });
    }

    if (key === "POST checkout") {
      const body = (await req.json()) as { packageId: string; email: string; name: string; promoCode?: string; interval?: "month" | "quarter" | "year" | "once" };
      if (!body.packageId || !body.name?.trim() || !isValidEmail(body.email)) {
        return error("Name, a valid email and a package are required");
      }
      const result = await createPackageCheckout(body);
      if (!result.url) {
        await practiceStore.saveAbandoned({
          id: `abn_${randomUUID()}`,
          firmId: FIRM_ID,
          name: body.name,
          email: body.email,
          packageId: body.packageId,
          packageName: result.invoice.packageName,
          createdAt: nowIso(),
          emailedAt: null,
        });
      }
      return json(result);
    }

    if (key === "POST checkout/complete") {
      const body = (await req.json()) as { sessionId: string; name?: string };
      if (!body.sessionId || body.sessionId.length > 200) return error("Checkout not found", 404);
      const snap = await practiceStore.snapshot();
      const invoice = snap.invoices.find((row) => row.stripeSessionId === body.sessionId);
      if (!invoice) return error("Checkout not found", 404);
      if (invoice.status === "paid") return json({ invoice, alreadyPaid: true });
      if (body.sessionId.startsWith("mock_")) {
        if (isProduction() && process.env.STRIPE_SECRET_KEY) return error("Mock checkout is disabled when Stripe is configured", 403);
      } else if (process.env.STRIPE_SECRET_KEY) {
        try {
          const Stripe = (await import("stripe")).default;
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          const session = await stripe.checkout.sessions.retrieve(body.sessionId);
          if (session.payment_status !== "paid") return error("Payment is not complete", 402);
        } catch {
          return error("Could not confirm Stripe checkout", 400);
        }
      } else {
        return error("Checkout is not confirmed", 400);
      }
      const paid = await markInvoicePaid(invoice);
      await runPaymentAutomation(paid, body.name || paid.email);
      return json({ invoice: paid, ok: true });
    }

    if (key === "POST checkout/abandon") {
      const body = (await req.json()) as { name: string; email: string; packageId: string; packageName?: string };
      if (!body.email || !isValidEmail(body.email) || !body.packageId) return error("Email and package are required");
      const catalog = await getPublishedCatalog();
      const pkg = catalog.packages.find((item) => item.id === body.packageId || item.slug === body.packageId);
      const saved = await practiceStore.saveAbandoned({
        id: `abn_${randomUUID()}`,
        firmId: FIRM_ID,
        name: body.name || body.email,
        email: body.email,
        packageId: pkg?.id || body.packageId,
        packageName: pkg?.name || body.packageName || body.packageId,
        createdAt: nowIso(),
        emailedAt: null,
      });
      return json({ abandoned: saved });
    }

    if (key === "POST classify") {
      const user = await requireUser();
      if (user.role === "marketing" || user.role === "developer") deny();
      const body = (await req.json()) as { fileName: string; mime?: string };
      const classified = classifyDocument(body.fileName || "", body.mime || "");
      const missing =
        /property|rental|landlord/i.test(body.fileName || "")
          ? ["Purchase completion statement", "Sale completion statement"]
          : [];
      return json({
        ...classified,
        confidenceScore: classified.confidence === "high" ? 92 : classified.confidence === "medium" ? 71 : 38,
        missing,
        extracted:
          classified.kind === "p60"
            ? { employerName: "Check the P60 employer box", payeIncome: "PAYE income", taxDeducted: "Tax deducted", nationalInsurance: "NI contributions" }
            : null,
      });
    }

    const user = await requireUser();

    if (key === "GET mail") {
      if (user.role === "marketing") deny();
      const logs = user.role === "client" ? await store.listMail(user.id) : await store.listMail();
      const redacted = redactMail(logs, user.id, user.role);
      if (user.role === "developer") {
        return json({ logs: redacted.map((row) => ({ id: row.id, kind: row.kind, createdAt: row.createdAt, to: row.to })) });
      }
      return json({ logs: redacted });
    }

    if (key === "GET packages") {
      must(user, "packages.manage");
      const packages = await listPackagesForAdmin();
      return json({ packages });
    }

    if (key === "POST packages") {
      must(user, "packages.manage");
      const body = (await req.json()) as Package;
      if (!body.id) body.id = body.slug || `pkg_${randomUUID()}`;
      try {
        const saved = await savePackageRecord({
          ...PACKAGES.find((row) => row.id === body.id),
          ...body,
          id: body.id,
          slug: body.slug || body.id,
          clientType: body.clientType || "Limited company",
          groupId: body.groupId || "limited-companies",
          vatNote: body.vatNote || "",
          billing: body.billing || "monthly",
          description: body.description || "",
          idealFor: body.idealFor || "",
          highlights: body.highlights || [],
          featureIds: body.featureIds || [],
          exclusions: body.exclusions || [],
          comparison: body.comparison || PACKAGES[0].comparison,
          onboardingKind: body.onboardingKind || "practice",
          isActive: body.isActive !== false,
        });
        await practiceStore.audit(user.id, user.email, "package.updated", `${saved.name} £${saved.monthlyPrice ?? saved.annualPrice ?? 0}`);
        return json({ package: saved });
      } catch (err) {
        return error(err instanceof Error ? err.message : "Could not save the package");
      }
    }

    if (key === "POST cms") {
      must(user, "cms.edit");
      const body = (await req.json()) as Partial<CmsPage>;
      const page: CmsPage = {
        id: body.id || `cms_${randomUUID()}`,
        firmId: FIRM_ID,
        slug: body.slug || "untitled",
        kind: body.kind || "page",
        title: body.title || "Untitled",
        seoTitle: body.seoTitle || body.title || "Untitled",
        description: body.description || "",
        html: sanitizeHtml(body.html || ""),
        published: body.published !== false,
        updatedAt: nowIso(),
        updatedBy: user.email,
      };
      const saved = await practiceStore.saveCms(page);
      await practiceStore.audit(user.id, user.email, "cms.updated", `${saved.slug} ${saved.title}`);
      return json({ page: saved });
    }

    if (key === "POST lead/status") {
      must(user, "crm.manage");
      const body = (await req.json()) as { id: string; status: LeadStatus };
      const snap = await practiceStore.snapshot();
      const current = snap.leads.find((row) => row.id === body.id);
      if (!current) return error("Lead not found", 404);
      const saved = await practiceStore.saveLead({
        ...current,
        status: body.status,
        activities: [...current.activities, { at: nowIso(), text: `Moved to ${body.status}` }],
      });
      return json({ lead: saved });
    }

    if (key === "POST promo") {
      must(user, "pricing.manage");
      const body = (await req.json()) as Partial<PromoCode>;
      const promo: PromoCode = {
        id: body.id || `promo_${randomUUID()}`,
        firmId: FIRM_ID,
        code: (body.code || "OFFER").toUpperCase(),
        kind: body.kind || "percent",
        amount: Number(body.amount || 0),
        expiresAt: body.expiresAt || null,
        usageLimit: body.usageLimit ?? null,
        used: body.used ?? 0,
        packageIds: body.packageIds || [],
        active: body.active !== false,
      };
      const saved = await practiceStore.savePromo(promo);
      await practiceStore.audit(user.id, user.email, "promo.updated", saved.code);
      return json({ promo: saved });
    }

    if (key === "POST refund") {
      must(user, "payments.refund");
      const body = (await req.json()) as { invoiceId: string; amountGbp: number; reason: string };
      const snap = await practiceStore.snapshot();
      const invoice = snap.invoices.find((row) => row.id === body.invoiceId);
      if (!invoice) return error("Invoice not found", 404);
      await practiceStore.saveInvoice({ ...invoice, status: "refunded" });
      await practiceStore.saveRefund({
        id: `ref_${randomUUID()}`,
        invoiceId: invoice.id,
        amountGbp: Number(body.amountGbp) || invoice.amountGbp,
        reason: body.reason || "Refund",
        userId: user.id,
        createdAt: nowIso(),
      });
      await store.addMail({
        to: invoice.email,
        subject: `Refund ${invoice.number}`,
        body: `We have refunded £${(Number(body.amountGbp) || invoice.amountGbp).toFixed(2)} for ${invoice.packageName}. ${body.reason || ""}`.trim(),
        kind: "refund",
        relatedUserId: invoice.userId || undefined,
      });
      await practiceStore.audit(user.id, user.email, "payment.refunded", `${invoice.number} £${body.amountGbp}`);
      return json({ ok: true });
    }

    if (key === "POST job") {
      must(user, "jobs.manage");
      const body = (await req.json()) as { id: string; status?: string; notes?: string; progress?: number };
      const snap = await practiceStore.snapshot();
      const job = snap.jobs.find((row) => row.id === body.id);
      if (!job) return error("Job not found", 404);
      const saved = await practiceStore.saveJob({
        ...job,
        status: (body.status as typeof job.status) || job.status,
        notes: body.notes ?? job.notes,
        progress: body.progress ?? job.progress,
        updatedAt: nowIso(),
      });
      return json({ job: saved });
    }

    if (key === "POST aml") {
      must(user, "aml.manage");
      const body = (await req.json()) as Partial<AmlCase> & { id: string };
      const snap = await practiceStore.snapshot();
      const current = snap.aml.find((row) => row.id === body.id);
      if (!current) return error("AML case not found", 404);
      const saved = await practiceStore.saveAml({ ...current, ...body, id: current.id, firmId: FIRM_ID });
      await practiceStore.audit(user.id, user.email, "aml.updated", `${saved.clientName} ${saved.status}`);
      return json({ aml: saved });
    }

    if (key === "POST automation") {
      must(user, "automation.manage");
      const body = (await req.json()) as { id?: string; name: string; packageId: string; steps: { action: AutomationAction; label: string }[]; active?: boolean };
      const saved = await practiceStore.saveAutomation({
        id: body.id || `auto_${randomUUID()}`,
        firmId: FIRM_ID,
        name: body.name,
        packageId: body.packageId || "all",
        active: body.active !== false,
        steps: (body.steps || []).map((step) => ({
          id: "id" in step && step.id ? String(step.id) : randomUUID(),
          action: step.action,
          label: step.label,
          delayHours: Number((step as { delayHours?: number }).delayHours || 0),
        })),
      });
      return json({ automation: saved });
    }

    if (key === "POST users") {
      must(user, "users.manage");
      const body = (await req.json()) as { email: string; name: string; role: UserRole; password: string };
      if (body.role === "super_admin" && user.role !== "super_admin") deny();
      const parts = body.name.trim().split(/\s+/);
      if (!isValidEmail(body.email) || !passwordMeetsPolicy(body.password || "")) {
        return error("Enter a valid email and a password of at least 10 characters with a letter and a number");
      }
      const created = await store.createUser({
        email: body.email,
        password: body.password,
        firstName: parts[0] || "User",
        lastName: parts.slice(1).join(" ") || "Staff",
        mobile: "",
        role: body.role,
        emailVerified: true,
      });
      await practiceStore.audit(user.id, user.email, "user.created", `${created.email} ${created.role}`);
      return json({ user: publicUser(created) });
    }

    if (key === "POST users/role") {
      must(user, "roles.manage");
      const body = (await req.json()) as { userId: string; role: UserRole };
      const target = await store.getUser(body.userId);
      if (!target) return error("User not found", 404);
      if (target.role === "super_admin" && user.role !== "super_admin") deny();
      const saved = await store.saveUser({ ...target, role: body.role });
      await practiceStore.audit(user.id, user.email, "user.role", `${saved.email} → ${saved.role}`);
      return json({ user: publicUser(saved) });
    }

    if (key === "GET users") {
      must(user, "users.manage");
      const rows = (await store.allUsers()).map((row) => publicUser(row));
      return json({ users: rows });
    }

    if (key === "GET catalog") {
      const catalog = await getPublishedCatalog();
      return json({ packages: catalog.packages.filter((item) => item.isActive) });
    }

    if (key === "POST subscription") {
      must(user, "payments.view");
      const body = (await req.json()) as { id: string; status: "active" | "paused" | "cancelled" };
      if (body.status !== "active") must(user, "payments.refund");
      const snap = await practiceStore.snapshot();
      const current = snap.subscriptions.find((row) => row.id === body.id);
      if (!current) return error("Subscription not found", 404);
      const saved = await practiceStore.saveSubscription({ ...current, status: body.status });
      await store.addMail({
        to: saved.email,
        subject: `Subscription ${saved.status}`,
        body: `Your ${saved.packageId} subscription is now ${saved.status}.`,
        kind: "subscription",
        relatedUserId: saved.userId || undefined,
      });
      await practiceStore.audit(user.id, user.email, "subscription.updated", `${saved.email} ${saved.status}`);
      return json({ subscription: saved });
    }

    if (key === "POST abandoned/follow-up") {
      must(user, "payments.view");
      const body = (await req.json()) as { id: string };
      const snap = await practiceStore.snapshot();
      const row = snap.abandoned.find((item) => item.id === body.id);
      if (!row) return error("Abandoned checkout not found", 404);
      await store.addMail({
        to: row.email,
        subject: `Still interested in ${row.packageName}?`,
        body: `You started checkout for ${row.packageName} with Wingate Accountants. Complete payment here: ${process.env.WINGATE_TAX_APP_URL || "http://127.0.0.1:43191"}/checkout/?package=${row.packageId}`,
        kind: "abandoned_checkout",
      });
      const saved = await practiceStore.saveAbandoned({ ...row, emailedAt: nowIso() });
      await practiceStore.audit(user.id, user.email, "checkout.followup", row.email);
      return json({ abandoned: saved });
    }

    if (key === "POST deadlines/remind") {
      must(user, "deadlines.view");
      if (user.role === "client") deny();
      const result = await sendDueReminders();
      await practiceStore.audit(user.id, user.email, "deadlines.reminded", `${result.sent} sent`);
      return json(result);
    }

    if (key === "POST deadlines") {
      must(user, "jobs.manage");
      const body = (await req.json()) as {
        id?: string;
        clientId?: string | null;
        clientName: string;
        kind: DeadlineKind;
        dueAt: string;
        status?: "upcoming" | "due_soon" | "overdue" | "completed";
      };
      const snap = await practiceStore.snapshot();
      const current = body.id ? snap.deadlines.find((row) => row.id === body.id) : undefined;
      const saved = await practiceStore.saveDeadline({
        id: current?.id || `dl_${randomUUID()}`,
        firmId: FIRM_ID,
        clientId: body.clientId === undefined ? current?.clientId ?? null : body.clientId,
        clientName: body.clientName || current?.clientName || "Client",
        kind: body.kind || current?.kind || "self_assessment",
        dueAt: body.dueAt || current?.dueAt || nowIso(),
        status: body.status || current?.status || "upcoming",
        lastReminderAt: current?.lastReminderAt ?? null,
        remindersSent: current?.remindersSent ?? [],
      });
      return json({ deadline: saved });
    }

    if (key === "POST aml/questionnaire") {
      if (user.role !== "client" && !can(user.role, "aml.manage")) deny();
      const body = (await req.json()) as { questionnaire: Record<string, string> };
      const snap = await practiceStore.snapshot();
      let current = snap.aml.find((row) => row.clientId === user.id);
      if (!current && user.role === "client") {
        current = {
          id: `aml_${randomUUID()}`,
          firmId: FIRM_ID,
          clientId: user.id,
          clientName: user.name,
          status: "pending",
          risk: "low",
          pep: /yes/i.test(body.questionnaire.pep || ""),
          sanctions: false,
          questionnaire: {},
          questionnaireAt: null,
          idDocumentStatus: "missing",
          poaStatus: "missing",
          selfieStatus: "missing",
          faceMatchConfirmed: false,
          staffNotes: "",
          matchScore: null,
          reviewDueAt: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          staffId: "usr_accountant",
        };
      }
      if (!current) return error("AML case not found", 404);
      const saved = await practiceStore.saveAml({
        ...current,
        questionnaire: { ...current.questionnaire, ...body.questionnaire },
        questionnaireAt: nowIso(),
        pep: /yes/i.test(body.questionnaire.pep || current.questionnaire.pep || ""),
        status: current.status === "approved" ? current.status : "under_review",
      });
      await practiceStore.audit(user.id, user.email, "aml.questionnaire", saved.clientName);
      return json({ aml: saved });
    }

    if (key === "POST profile") {
      const body = (await req.json()) as Partial<ClientProfile> & { userId?: string };
      const targetId = user.role === "client" ? user.id : body.userId || user.id;
      if (user.role === "client" && targetId !== user.id) deny();
      if (user.role !== "client" && !can(user.role, "clients.manage") && !can(user.role, "clients.view")) deny();
      const snap = await practiceStore.snapshot();
      const current = snap.profiles.find((row) => row.userId === targetId) || emptyProfile(targetId);
      const saved = await practiceStore.saveProfile({
        ...current,
        ...body,
        userId: targetId,
        updatedAt: nowIso(),
      });
      await practiceStore.audit(user.id, user.email, "profile.updated", targetId);
      return json({ profile: saved, onboarding: profileProgress(saved) });
    }

    if (key === "POST lead/note") {
      must(user, "crm.manage");
      const body = (await req.json()) as { id: string; text: string };
      const snap = await practiceStore.snapshot();
      const current = snap.leads.find((row) => row.id === body.id);
      if (!current) return error("Lead not found", 404);
      const saved = await practiceStore.saveLead({
        ...current,
        notes: [current.notes, body.text].filter(Boolean).join("\n"),
        activities: [...current.activities, { at: nowIso(), text: body.text }],
      });
      return json({ lead: saved });
    }

    return error("Not found", 404);
  } catch (err) {
    const { message, status } = publicError(err);
    return error(message, status);
  }
}
