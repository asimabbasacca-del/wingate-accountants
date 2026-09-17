import { randomUUID } from "node:crypto";
import { FIRM_ID } from "@/lib/tax-returns/types";
import { nowIso } from "@/lib/tax-returns/crypto";
import { store } from "@/lib/tax-returns/store";
import { appOrigin } from "@/lib/tax-returns/mail";
import { practiceStore } from "./store";
import { jobFromPayment } from "./stripe";
import type { AutomationRule, PracticeInvoice } from "./types";

export async function runPaymentAutomation(invoice: PracticeInvoice, payerName: string): Promise<void> {
  const snap = await practiceStore.snapshot();
  const rule: AutomationRule | undefined =
    snap.automations.find((item) => item.active && item.packageId === invoice.packageId) ??
    snap.automations.find((item) => item.active && item.packageId === "all");
  const steps = rule?.steps ?? [
    { id: "d1", action: "create_client" as const, label: "Create client", delayHours: 0 },
    { id: "d2", action: "create_job" as const, label: "Create job", delayHours: 0 },
    { id: "d3", action: "send_email" as const, label: "Send welcome email", delayHours: 0 },
    { id: "d4", action: "send_engagement_letter" as const, label: "Send engagement letter", delayHours: 0 },
    { id: "d5", action: "request_documents" as const, label: "Request documents", delayHours: 1 },
    { id: "d6", action: "assign_staff" as const, label: "Assign staff", delayHours: 0 },
    { id: "d7", action: "create_tasks" as const, label: "Create tasks", delayHours: 0 },
    { id: "d8", action: "schedule_reminders" as const, label: "Schedule reminders", delayHours: 24 },
  ];

  let user = await store.getUserByEmail(invoice.email);
  const parts = payerName.trim().split(/\s+/);
  if (!user) {
    const password = `Wingate${randomUUID().slice(0, 8)}`;
    user = await store.createUser({
      email: invoice.email,
      password,
      firstName: parts[0] || "Client",
      lastName: parts.slice(1).join(" ") || "Client",
      mobile: "",
      role: "client",
      emailVerified: true,
    });
    await store.addMail({
      to: user.email,
      subject: "Your Wingate client portal",
      body: `Your account is ready. Sign in at ${appOrigin()}/sign-in/ with ${user.email}. A temporary password was generated for you — use Forgot password if you need a new one.`,
      kind: "welcome",
      relatedUserId: user.id,
    });
  }

  await practiceStore.saveInvoice({ ...invoice, userId: user.id });

  for (const step of steps) {
    if (step.action === "create_job") {
      await practiceStore.saveJob(jobFromPayment(invoice, user.id, user.name));
    }
    if (step.action === "send_email") {
      await store.addMail({
        to: user.email,
        subject: `Payment confirmation ${invoice.number}`,
        body: `Thank you. We have received £${invoice.amountGbp.toFixed(2)} for ${invoice.packageName}. Invoice ${invoice.number}.`,
        kind: "payment_confirmation",
        relatedUserId: user.id,
      });
    }
    if (step.action === "send_engagement_letter") {
      await store.addMail({
        to: user.email,
        subject: "Engagement letter ready to sign",
        body: `Please sign your engagement letter in the portal: ${appOrigin()}/portal/tax-returns/`,
        kind: "engagement_letter",
        relatedUserId: user.id,
      });
    }
    if (step.action === "request_documents") {
      await store.addMail({
        to: user.email,
        subject: "Documents we need",
        body: "Please upload ID, proof of address and the records listed in your portal.",
        kind: "document_request",
        relatedUserId: user.id,
      });
    }
    if (step.action === "schedule_reminders") {
      const due = `${new Date().getFullYear() + 1}-01-31T09:00:00.000Z`;
      await practiceStore.saveDeadline({
        id: `dl_${randomUUID()}`,
        firmId: FIRM_ID,
        clientId: user.id,
        clientName: user.name,
        kind: "self_assessment",
        dueAt: due,
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      });
    }
  }

  await practiceStore.saveAml({
    id: `aml_${randomUUID()}`,
    firmId: FIRM_ID,
    clientId: user.id,
    clientName: user.name,
    status: "pending",
    risk: "low",
    pep: false,
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
  });

  await practiceStore.audit(user.id, user.email, "payment.completed", `${invoice.number} ${invoice.packageName} £${invoice.amountGbp}`);
}
