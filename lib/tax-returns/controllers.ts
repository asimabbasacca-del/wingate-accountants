import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { clearSession, createSession, publicUser, readSessionUser } from "./session";
import { store } from "./store";
import { nowIso, randomToken, sixDigitCode, verifyPassword, passwordMeetsPolicy, verifyPasswordDummy } from "./crypto";
import { AmlService } from "./aml-service";
import { EngagementLetterService } from "./engagement-letter-service";
import { PaymentService } from "./payment-service";
import { HmrcSubmissionService } from "./hmrc-submission-service";
import { calculateEstimate } from "./tax-calculation";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES, parseDataUrl, readBinary, saveBinary } from "./files";
import { personalReady } from "./questionnaire";
import { classifyDocument, missingDocuments, nextTaxYear, outstandingTasks, progressTimeline, statusLabel } from "./intelligence";
import { MAIL_COPY, appOrigin, hashSecret } from "./mail";
import type { InvoiceView, PlanId, QuestionnaireAnswers, TaxDocumentKind, User } from "./types";
import { TAX_YEAR } from "./types";
import { isTaxStaff } from "@/lib/practice/roles";
import { PLANS, getPlan } from "./plans";
import { mailPreviewEnabled, clientIp } from "@/lib/security/config";
import { rateLimit } from "@/lib/security/rate-limit";
import { isSafeFileId, isValidEmail, safeFileName } from "@/lib/security/html";
import { publicError } from "@/lib/security/errors";
import { securityLog } from "@/lib/security/log";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function error(message: string, status = 400) {
  return json({ error: message }, status);
}

function tooMany(req: NextRequest, name: string) {
  const limited = rateLimit(`auth:${name}:${clientIp(req)}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    securityLog("rate_limited", { name, ip: clientIp(req) });
    return error("Too many requests. Try again shortly.", 429);
  }
  return null;
}

async function requireUser() {
  const user = await readSessionUser();
  if (!user) throw Object.assign(new Error("Please sign in"), { status: 401 });
  return user;
}

async function requireOrder(user: User, orderId: string) {
  const order = await store.getOrder(orderId);
  if (!order) throw Object.assign(new Error("Tax return not found"), { status: 404 });
  if (!isTaxStaff(user.role) && order.userId !== user.id) {
    throw Object.assign(new Error("You cannot open this file"), { status: 403 });
  }
  return order;
}

async function issueEmailCode(user: User, kind: "email_verify" | "password_reset" | "two_factor", rememberMe = false) {
  const token = randomToken();
  const code = sixDigitCode();
  const hours = kind === "two_factor" ? 0.25 : 24;
  await store.addAuthToken({
    userId: user.id,
    kind,
    tokenHash: hashSecret(token),
    codeHash: hashSecret(code),
    expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
    rememberMe,
  });
  const origin = appOrigin();
  const link =
    kind === "email_verify"
      ? `${origin}/verify-email/?token=${token}`
      : kind === "password_reset"
        ? `${origin}/reset-password/?token=${token}`
        : `${origin}/sign-in/?challenge=1`;
  const subject =
    kind === "email_verify" ? MAIL_COPY.verifySubject : kind === "password_reset" ? MAIL_COPY.resetSubject : MAIL_COPY.twoFactorSubject;
  const body =
    kind === "two_factor"
      ? `Your Wingate sign-in code is ${code}. It expires in 15 minutes.`
      : `Use code ${code} or open ${link}`;
  await store.addMail({
    to: user.email,
    subject,
    body,
    kind,
    relatedUserId: user.id,
  });
  return { token, code, link };
}

function invoicesFor(order: NonNullable<Awaited<ReturnType<typeof store.bundle>>>["order"]): InvoiceView[] {
  if (!order.planId) return [];
  const plan = getPlan(order.planId);
  return [
    {
      id: order.id,
      description: `${plan?.name ?? "Tax return"} · ${order.taxYear}`,
      amountGbp: order.amountGbp,
      status: order.payment.status,
      paidAt: order.payment.paidAt,
    },
  ];
}

async function dashboardPayload(user: User, orderId?: string | null) {
  await store.processReminders();
  const orders = isTaxStaff(user.role) ? await store.listedOrders() : await store.ordersForUser(user.id);
  let order = orderId ? await store.getOrder(orderId) : null;
  if (order && !isTaxStaff(user.role) && order.userId !== user.id) order = null;
  if (!order && user.role === "client") order = orders[0] ?? null;
  const bundle = order ? await store.bundle(order.id) : null;
  const tasks = user.role === "client" ? outstandingTasks(bundle) : [];
  return {
    user: publicUser(user),
    orders,
    plans: PLANS,
    bundle,
    dashboard: {
      title: "My Tax Portal",
      currentService: bundle?.order.planId ? getPlan(bundle.order.planId)?.name ?? "Online Tax Return Preparation Service" : "No package selected",
      currentTaxYear: bundle?.order.taxYear ?? TAX_YEAR,
      nextTaxYear: nextTaxYear(bundle?.order.taxYear ?? TAX_YEAR),
      status: bundle ? statusLabel(bundle.order.status) : "Choose a package",
      outstandingTasks: tasks,
      unreadMessages: bundle?.messages.filter((item) => item.authorRole === "accountant").length ?? 0,
      uploadedDocuments: bundle?.documents.length ?? 0,
      invoices: bundle ? invoicesFor(bundle.order) : [],
      timeline: progressTimeline(bundle),
      missingDocuments: bundle ? missingDocuments(bundle.questionnaire?.answers, bundle.documents) : [],
      amlStatus: bundle?.aml?.status ?? "not_started",
      renewalNote: `We will email you before the ${nextTaxYear(bundle?.order.taxYear ?? TAX_YEAR)} tax year opens so you can start the next Self Assessment in this portal.`,
    },
  };
}

export const TaxReturnController = {
  async me() {
    const user = await readSessionUser();
    if (!user) return json({ user: null });
    return json(await dashboardPayload(user));
  },

  async register(req: NextRequest) {
    const limited = tooMany(req, "register");
    if (limited) return limited;
    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      mobile?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: boolean;
      acceptPrivacy?: boolean;
    };
    const firstName = body.firstName?.trim() || body.name?.trim().split(/\s+/)[0] || "";
    const lastName = body.lastName?.trim() || body.name?.trim().split(/\s+/).slice(1).join(" ") || "";
    if (!firstName || !lastName) return error("Enter your first name and last name");
    if (!isValidEmail(body.email)) return error("Enter a valid email address");
    if (!body.mobile?.trim() || body.mobile.trim().replace(/\s/g, "").length < 10) {
      return error("Enter a UK mobile number");
    }
    if (!body.password || !passwordMeetsPolicy(body.password)) {
      return error("Choose a password of at least 10 characters with a letter and a number");
    }
    if (body.confirmPassword && body.confirmPassword !== body.password) return error("Passwords do not match");
    if (!body.acceptTerms || !body.acceptPrivacy) {
      return error("Please agree to the Terms & Conditions and Privacy Policy");
    }
    const user = await store.createUser({
      firstName,
      lastName,
      email: body.email,
      mobile: body.mobile,
      password: body.password,
    });
    const issued = await issueEmailCode(user, "email_verify");
    await store.addReminder({
      userId: user.id,
      kind: "verify_email",
      sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      subject: MAIL_COPY.verifySubject,
      body: "Please verify your email so you can open your Wingate tax portal.",
    });
    return json({
      ok: true,
      needsVerification: true,
      email: user.email,
      preview: mailPreviewEnabled()
        ? {
            code: issued.code,
            link: issued.link,
            note: "Local mail preview until SMTP is connected. Production never returns this code.",
          }
        : undefined,
    });
  },

  async verifyEmail(req: NextRequest) {
    const body = (await req.json()) as { token?: string; code?: string; email?: string };
    const secret = body.token?.trim() || body.code?.trim();
    if (!secret) return error("Enter the verification code from your email");
    const token = await store.consumeAuthSecret("email_verify", secret);
    if (!token) return error("That code has expired or is not valid");
    const user = await store.markEmailVerified(token.userId);
    return json({ ok: true, email: user.email });
  },

  async resendVerification(req: NextRequest) {
    const limited = tooMany(req, "resend");
    if (limited) return limited;
    const body = (await req.json()) as { email?: string };
    const user = await store.getUserByEmail(body.email ?? "");
    if (!user) return json({ ok: true });
    if (user.emailVerified) return json({ ok: true, alreadyVerified: true });
    const issued = await issueEmailCode(user, "email_verify");
    return json({
      ok: true,
      preview: mailPreviewEnabled() ? { code: issued.code, link: issued.link } : undefined,
    });
  },

  async login(req: NextRequest) {
    const limited = tooMany(req, "login");
    if (limited) return limited;
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
      code?: string;
    };
    const user = await store.getUserByEmail(body.email ?? "");
    if (!user) {
      verifyPasswordDummy(body.password ?? "");
      securityLog("login_failed", { reason: "unknown_user", ip: clientIp(req) });
      return error("Email or password is not right", 401);
    }
    if (!verifyPassword(body.password ?? "", user.passwordHash)) {
      securityLog("login_failed", { reason: "bad_password", userId: user.id, ip: clientIp(req) });
      await store.addMail({
        to: "security@wingateaccountants.co.uk",
        subject: "Failed sign-in",
        body: `Failed sign-in for ${user.email} from ${clientIp(req)}.`,
        kind: "security",
        relatedUserId: user.id,
      }).catch(() => undefined);
      return error("Email or password is not right", 401);
    }
    if (!user.emailVerified) {
      return json({ needsVerification: true, email: user.email, error: "Please verify your email before signing in" }, 403);
    }
    if (user.twoFactorEnabled && !body.code) {
      const issued = await issueEmailCode(user, "two_factor", Boolean(body.rememberMe));
      return json({
        requiresTwoFactor: true,
        email: user.email,
        preview: mailPreviewEnabled() ? { code: issued.code } : undefined,
      });
    }
    if (user.twoFactorEnabled && body.code) {
      const token = await store.consumeAuthSecret("two_factor", body.code);
      if (!token || token.userId !== user.id) return error("That sign-in code is not valid", 401);
      await createSession(user.id, token.rememberMe || Boolean(body.rememberMe));
      return json({ user: publicUser(user) });
    }
    await createSession(user.id, Boolean(body.rememberMe));
    return json({ user: publicUser(user) });
  },

  async forgotPassword(req: NextRequest) {
    const limited = tooMany(req, "forgot");
    if (limited) return limited;
    const body = (await req.json()) as { email?: string };
    const user = await store.getUserByEmail(body.email ?? "");
    if (!user) return json({ ok: true });
    const issued = await issueEmailCode(user, "password_reset");
    return json({ ok: true, preview: mailPreviewEnabled() ? { code: issued.code, link: issued.link } : undefined });
  },

  async resetPassword(req: NextRequest) {
    const limited = tooMany(req, "reset");
    if (limited) return limited;
    const body = (await req.json()) as { token?: string; code?: string; password?: string; confirmPassword?: string };
    if (!body.password || !passwordMeetsPolicy(body.password)) {
      return error("Choose a password of at least 10 characters with a letter and a number");
    }
    if (body.confirmPassword && body.confirmPassword !== body.password) return error("Passwords do not match");
    const secret = body.token?.trim() || body.code?.trim();
    if (!secret) return error("Enter the reset code from your email");
    const token = await store.consumeAuthSecret("password_reset", secret);
    if (!token) return error("That reset link has expired or is not valid");
    await store.setPassword(token.userId, body.password);
    return json({ ok: true });
  },

  async enableTwoFactor(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { enabled?: boolean; password?: string };
    if (!verifyPassword(body.password ?? "", user.passwordHash)) return error("Enter your current password", 401);
    const next = await store.saveUser({ ...user, twoFactorEnabled: body.enabled !== false });
    return json({ user: publicUser(next) });
  },

  async logout() {
    await clearSession();
    return json({ ok: true });
  },

  async state(req: NextRequest) {
    const user = await requireUser();
    const orderId = req.nextUrl.searchParams.get("orderId");
    let order = orderId ? await requireOrder(user, orderId) : null;
    if (!order && user.role === "client") {
      const list = await store.ordersForUser(user.id);
      order = list[0] ?? null;
    }
    if (!order) return json(await dashboardPayload(user));
    return json(await dashboardPayload(user, order.id));
  },

  async startOrder(req: NextRequest) {
    const user = await requireUser();
    if (user.role !== "client") return error("Only clients open a tax return file", 403);
    const body = (await req.json().catch(() => ({}))) as { planId?: PlanId };
    let order = (await store.ordersForUser(user.id)).find((item) => item.status !== "complete") ?? (await store.createOrder(user.id));
    if (body.planId && order.payment.status !== "paid") {
      order = await PaymentService.selectPlan(order, body.planId);
    }
    await store.addReminder({
      userId: user.id,
      orderId: order.id,
      kind: "outstanding_task",
      sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      subject: MAIL_COPY.reminderSubject,
      body: "You have a step waiting on your Online Tax Return Preparation Service file.",
    });
    return json({ order });
  },

  async selectPlan(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string; planId?: PlanId };
    const order = await requireOrder(user, body.orderId ?? "");
    if (user.role !== "client") return error("Only the client can choose a plan", 403);
    const next = await PaymentService.selectPlan(order, body.planId as PlanId);
    return json({ order: next });
  },

  async uploadDocument(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as {
      orderId?: string;
      kind?: TaxDocumentKind;
      fileName?: string;
      dataUrl?: string;
    };
    const order = await requireOrder(user, body.orderId ?? "");
    if (!body.kind || !body.fileName || !body.dataUrl) return error("Choose a document type and file");
    const { bytes, mimeType } = parseDataUrl(body.dataUrl);
    if (bytes.length > MAX_UPLOAD_BYTES) return error("Each file must be 8MB or smaller");
    if (!ALLOWED_UPLOAD_TYPES.has(mimeType)) return error("That file type is not accepted");
    const file = await store.addFile({
      orderId: order.id,
      originalName: body.fileName,
      mimeType,
      size: bytes.length,
    });
    await saveBinary(file.id, bytes, mimeType);
    const classified = classifyDocument(body.fileName, mimeType);
    const doc = await store.addDocument({
      id: `doc_${randomUUID()}`,
      firmId: order.firmId,
      orderId: order.id,
      kind: body.kind === "other" ? classified.kind : body.kind,
      fileId: file.id,
      fileName: body.fileName,
      uploadedAt: nowIso(),
      requested: false,
      classifiedAs: classified.label,
      classificationConfidence: classified.confidence,
    });
    if (["questionnaire_complete", "documents_pending", "info_requested"].includes(order.status)) {
      await store.saveOrder({ ...order, status: "accountant_review" });
    }
    return json({ document: doc });
  },

  async message(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string; body?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    if (!body.body?.trim()) return error("Write a message");
    const message = await store.addMessage({
      id: `msg_${randomUUID()}`,
      firmId: order.firmId,
      orderId: order.id,
      authorId: user.id,
      authorRole: user.role,
      body: body.body.trim(),
      createdAt: nowIso(),
    });
    return json({ message });
  },

  async markDocumentsDone(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const next = await store.saveOrder({ ...order, status: "accountant_review" });
    return json({ order: next });
  },

  async requestInfo(req: NextRequest) {
    const user = await requireUser();
    if (!isTaxStaff(user.role)) return error("Only practice staff can request information", 403);
    const body = (await req.json()) as { orderId?: string; body?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    await store.addNote({
      id: `note_${randomUUID()}`,
      firmId: order.firmId,
      orderId: order.id,
      authorId: user.id,
      kind: "info_request",
      body: body.body?.trim() || "Please send the missing records.",
      createdAt: nowIso(),
    });
    await store.addMessage({
      id: `msg_${randomUUID()}`,
      firmId: order.firmId,
      orderId: order.id,
      authorId: user.id,
      authorRole: "accountant",
      body: body.body?.trim() || "Please upload the missing records in your portal.",
      createdAt: nowIso(),
    });
    const next = await store.saveOrder({ ...order, status: "info_requested" });
    return json({ order: next });
  },

  async prepare(req: NextRequest) {
    const user = await requireUser();
    if (!isTaxStaff(user.role)) return error("Only practice staff can prepare the return", 403);
    const body = (await req.json()) as { orderId?: string; narrative?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const q = await store.getQuestionnaire(order.id);
    const estimate = q?.estimate ?? calculateEstimate(q?.answers ?? ({} as QuestionnaireAnswers));
    const next = await store.saveOrder({
      ...order,
      status: "awaiting_client_approval",
      taxSummary: {
        preparedAt: nowIso(),
        preparedBy: user.name,
        totalIncome: estimate.totalIncome,
        taxDue: estimate.estimatedLiability,
        refundDue: estimate.estimatedRefund,
        narrative: body.narrative?.trim() || "Computation prepared from your questionnaire and documents. Please approve if the figures are right.",
      },
    });
    await store.addMessage({
      id: `msg_${randomUUID()}`,
      firmId: order.firmId,
      orderId: order.id,
      authorId: user.id,
      authorRole: "accountant",
      body: "Your tax return is ready to approve in the portal.",
      createdAt: nowIso(),
    });
    return json({ order: next });
  },

  async approve(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    if (user.role !== "client") return error("Only the client can approve the return", 403);
    if (order.status !== "awaiting_client_approval" && order.status !== "prepared") {
      return error("The return is not waiting for your approval");
    }
    const next = await store.saveOrder({ ...order, status: "approved" });
    return json({ order: next });
  },

  async file(req: NextRequest) {
    const user = await requireUser();
    const fileId = req.nextUrl.searchParams.get("id") || "";
    if (!isSafeFileId(fileId)) return error("Missing file");
    const meta = await store.getFile(fileId);
    if (!meta) return error("File not found", 404);
    await requireOrder(user, meta.orderId);
    const bytes = await readBinary(fileId);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": meta.mimeType,
        "Content-Disposition": `attachment; filename="${safeFileName(meta.originalName)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  },
};

export const PaymentController = {
  async checkout(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const result = await PaymentService.checkout(order);
    return json(result);
  },
  async confirm(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string; sessionId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const next = await PaymentService.confirm(order, body.sessionId);
    return json({ order: next });
  },
};

export const AmlController = {
  async submit(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as {
      orderId?: string;
      idKind?: "passport" | "driving_licence";
      idFileName?: string;
      idDataUrl?: string;
      poa?: { kind: string; fileName: string; dated: string; dataUrl: string }[];
      selfieFileName?: string;
      selfieDataUrl?: string;
    };
    const order = await requireOrder(user, body.orderId ?? "");
    const aml = await AmlService.submit(order.id, {
      idKind: body.idKind ?? "passport",
      idFileName: body.idFileName ?? "identity",
      idDataUrl: body.idDataUrl ?? "",
      poa: body.poa ?? [],
      selfieFileName: body.selfieFileName,
      selfieDataUrl: body.selfieDataUrl,
    });
    return json({ aml });
  },
  async review(req: NextRequest) {
    const user = await requireUser();
    if (!isTaxStaff(user.role)) return error("Only practice staff can review AML", 403);
    const body = (await req.json()) as { orderId?: string; status?: "approved" | "rejected"; notes?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const aml = await AmlService.review(order.id, body.status ?? "approved", body.notes ?? "", user.id);
    return json({ aml });
  },
};

export const QuestionnaireController = {
  async save(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as {
      orderId?: string;
      answers?: QuestionnaireAnswers;
      currentSection?: string;
      complete?: boolean;
    };
    const order = await requireOrder(user, body.orderId ?? "");
    const row = await store.getQuestionnaire(order.id);
    if (!row || !body.answers) return error("Questionnaire missing");
    if (body.complete && !personalReady(body.answers)) return error("Complete your personal details before finishing");
    const estimate = calculateEstimate(body.answers);
    const next = await store.saveQuestionnaire({
      ...row,
      answers: body.answers,
      estimate,
      currentSection: body.currentSection ?? row.currentSection,
      completedAt: body.complete ? nowIso() : row.completedAt,
    });
    if (body.complete) {
      await store.saveOrder({ ...order, status: "documents_pending" });
    } else if (order.status === "engagement_signed") {
      await store.saveOrder({ ...order, status: "questionnaire_in_progress" });
    }
    return json({ questionnaire: next });
  },
  async generateLetter(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const letter = await EngagementLetterService.generate(order.id);
    return json({ letter });
  },
  async signLetter(req: NextRequest) {
    const user = await requireUser();
    const body = (await req.json()) as { orderId?: string; signerName?: string; signatureDataUrl?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const letter = await EngagementLetterService.sign(order.id, body.signerName || user.name, body.signatureDataUrl ?? "");
    return json({ letter });
  },
};

export const HmrcController = {
  async submit(req: NextRequest) {
    const user = await requireUser();
    if (!isTaxStaff(user.role)) return error("Only practice staff can file with HMRC", 403);
    const body = (await req.json()) as { orderId?: string };
    const order = await requireOrder(user, body.orderId ?? "");
    const submission = await HmrcSubmissionService.submit(order, user.name);
    return json({ submission });
  },
};

export async function dispatchTaxReturns(req: NextRequest, path: string[]): Promise<NextResponse> {
  const key = `${req.method}:${path.filter(Boolean).join("/")}`;
  try {
    switch (key) {
      case "GET:auth/me":
        return await TaxReturnController.me();
      case "POST:auth/register":
        return await TaxReturnController.register(req);
      case "POST:auth/login":
        return await TaxReturnController.login(req);
      case "POST:auth/logout":
        return await TaxReturnController.logout();
      case "POST:auth/verify-email":
        return await TaxReturnController.verifyEmail(req);
      case "POST:auth/resend-verification":
        return await TaxReturnController.resendVerification(req);
      case "POST:auth/forgot":
        return await TaxReturnController.forgotPassword(req);
      case "POST:auth/reset":
        return await TaxReturnController.resetPassword(req);
      case "POST:auth/2fa":
        return await TaxReturnController.enableTwoFactor(req);
      case "GET:state":
        return await TaxReturnController.state(req);
      case "POST:orders/start":
        return await TaxReturnController.startOrder(req);
      case "POST:orders/plan":
        return await TaxReturnController.selectPlan(req);
      case "POST:payments/checkout":
        return await PaymentController.checkout(req);
      case "POST:payments/confirm":
        return await PaymentController.confirm(req);
      case "POST:aml":
        return await AmlController.submit(req);
      case "POST:aml/review":
        return await AmlController.review(req);
      case "POST:engagement/generate":
        return await QuestionnaireController.generateLetter(req);
      case "POST:engagement/sign":
        return await QuestionnaireController.signLetter(req);
      case "POST:questionnaire":
        return await QuestionnaireController.save(req);
      case "POST:documents":
        return await TaxReturnController.uploadDocument(req);
      case "POST:documents/complete":
        return await TaxReturnController.markDocumentsDone(req);
      case "POST:messages":
        return await TaxReturnController.message(req);
      case "POST:accountant/request-info":
        return await TaxReturnController.requestInfo(req);
      case "POST:accountant/prepare":
        return await TaxReturnController.prepare(req);
      case "POST:client/approve":
        return await TaxReturnController.approve(req);
      case "POST:hmrc/submit":
        return await HmrcController.submit(req);
      case "GET:files":
        return await TaxReturnController.file(req);
      default:
        return error("Unknown tax-returns action", 404);
    }
  } catch (err) {
    const { message, status } = publicError(err);
    return error(message, status);
  }
}
