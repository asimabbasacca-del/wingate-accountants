import type { OrderBundle, OrderStatus, OutstandingTask, QuestionnaireAnswers, TaxDocument, TaxDocumentKind } from "./types";
import { suggestedDocuments } from "./questionnaire";

export type ClassifiedUpload = {
  kind: TaxDocumentKind;
  label: string;
  confidence: "high" | "medium" | "low";
};

export function classifyDocument(filename: string, mime: string): ClassifiedUpload {
  const n = filename.toLowerCase();
  if (/p60/.test(n)) return { kind: "p60", label: "Employment (P60)", confidence: "high" };
  if (/p45/.test(n)) return { kind: "p45", label: "Employment (P45)", confidence: "high" };
  if (/p11d/.test(n)) return { kind: "other", label: "Benefits (P11D)", confidence: "high" };
  if (/sa302|tax.?comp/.test(n)) return { kind: "sa302", label: "Prior year SA302", confidence: "high" };
  if (/sa100|tax.?return/.test(n)) return { kind: "other", label: "Prior year tax return", confidence: "high" };
  if (/dividend/.test(n)) return { kind: "other", label: "Dividend voucher", confidence: "high" };
  if (/bank|statement/.test(n)) return { kind: "bank_statement", label: "Bank statement", confidence: "high" };
  if (/rent|landlord|property/.test(n)) return { kind: "rental_spreadsheet", label: "Rental income records", confidence: "high" };
  if (/invoice|receipt/.test(n)) return { kind: "invoice", label: "Invoice or receipt", confidence: "medium" };
  if (/passport|driving|licence|license|\bid\b/.test(n)) return { kind: "other", label: "Identity document", confidence: "high" };
  if (/utility|council.?tax|proof.?of.?address/.test(n)) return { kind: "other", label: "Proof of address", confidence: "medium" };
  if (mime.startsWith("image/")) return { kind: "other", label: "Image — accountant will review", confidence: "low" };
  return { kind: "other", label: "Unclassified — accountant will review", confidence: "low" };
}

export function missingDocuments(answers: QuestionnaireAnswers | undefined, documents: TaxDocument[]): string[] {
  const needed = suggestedDocuments(answers ?? ({} as QuestionnaireAnswers));
  const uploadedKinds = new Set(documents.map((doc) => doc.kind));
  const uploadedNames = documents.map((doc) => `${doc.fileName} ${doc.classifiedAs}`.toLowerCase());
  return needed
    .filter((item) => {
      if (uploadedKinds.has(item.kind) && item.kind !== "other") return false;
      const words = item.label.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      return !words.some((word) => uploadedNames.some((name) => name.includes(word)));
    })
    .map((item) => item.label);
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  account_created: "Choose a package",
  plan_selected: "Pay for your package",
  payment_pending: "Pay for your package",
  paid: "Complete AML / KYC checks",
  aml_pending: "Complete AML / KYC checks",
  aml_submitted: "Sign your engagement letter",
  engagement_pending: "Sign your engagement letter",
  engagement_signed: "Complete the tax questionnaire",
  questionnaire_in_progress: "Complete the tax questionnaire",
  questionnaire_complete: "Upload your documents",
  documents_pending: "Upload your documents",
  accountant_review: "Your accountant is reviewing the file",
  info_requested: "Send the information your accountant asked for",
  prepared: "Approve your tax return",
  awaiting_client_approval: "Approve your tax return",
  approved: "Waiting for HMRC filing",
  hmrc_submitted: "Filed with HMRC",
  complete: "Complete",
};

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function outstandingTasks(bundle: OrderBundle | null): OutstandingTask[] {
  if (!bundle) {
    return [
      {
        id: "choose-package",
        label: "Choose an Online Tax Return Preparation Service package",
        href: "/online-tax-return-preparation-service/#packages",
      },
    ];
  }
  const tasks: OutstandingTask[] = [];
  const { order, aml, letter, questionnaire, documents, messages } = bundle;
  if (!order.planId || order.status === "account_created") {
    tasks.push({ id: "plan", label: "Choose a tax return package", href: "/tax-returns/onboarding/" });
  }
  if (order.planId && order.payment.status !== "paid") {
    tasks.push({ id: "pay", label: "Pay for your package", href: "/tax-returns/onboarding/" });
  }
  if (order.payment.status === "paid" && (!aml || aml.status === "not_started" || aml.status === "rejected")) {
    tasks.push({ id: "aml", label: "Complete AML / KYC identity checks", href: "/tax-returns/onboarding/" });
  }
  if (aml && (aml.status === "submitted" || aml.status === "under_review" || aml.status === "approved") && letter?.status !== "signed") {
    tasks.push({ id: "letter", label: "Sign your engagement letter", href: "/tax-returns/onboarding/" });
  }
  if (letter?.status === "signed" && !questionnaire?.completedAt) {
    tasks.push({ id: "questions", label: "Complete the tax questionnaire", href: "/tax-returns/onboarding/" });
  }
  if (questionnaire?.completedAt && ["questionnaire_complete", "documents_pending", "info_requested"].includes(order.status)) {
    tasks.push({ id: "docs", label: "Upload remaining tax documents", href: "/portal/tax-returns/documents/" });
  }
  const unreadFromAccountant = messages.filter((item) => item.authorRole === "accountant").length;
  if (unreadFromAccountant && order.status === "info_requested") {
    tasks.push({ id: "message", label: "Read the message from your accountant", href: "/portal/tax-returns/messages/" });
  }
  if (order.status === "awaiting_client_approval" || order.status === "prepared") {
    tasks.push({ id: "approve", label: "Approve your tax return", href: "/portal/tax-returns/" });
  }
  if (documents.length && missingDocuments(questionnaire?.answers, documents).length) {
    if (!tasks.some((task) => task.id === "docs")) {
      tasks.push({ id: "missing", label: "Upload documents the checker still expects", href: "/portal/tax-returns/documents/" });
    }
  }
  return tasks;
}

export type TimelineStep = {
  id: string;
  label: string;
  state: "done" | "current" | "upcoming";
};

export function progressTimeline(bundle: OrderBundle | null): TimelineStep[] {
  const steps = [
    { id: "account", label: "Account created", done: Boolean(bundle) },
    { id: "plan", label: "Package selected", done: Boolean(bundle?.order.planId) },
    { id: "pay", label: "Package paid", done: bundle?.order.payment.status === "paid" },
    {
      id: "aml",
      label: "AML / KYC",
      done: Boolean(bundle?.aml && ["submitted", "under_review", "approved"].includes(bundle.aml.status)),
    },
    { id: "letter", label: "Engagement letter signed", done: bundle?.letter?.status === "signed" },
    { id: "questions", label: "Questionnaire complete", done: Boolean(bundle?.questionnaire?.completedAt) },
    {
      id: "docs",
      label: "Documents uploaded",
      done: Boolean(bundle && bundle.documents.length > 0 && !["questionnaire_complete", "documents_pending"].includes(bundle.order.status)),
    },
    {
      id: "review",
      label: "Accountant review",
      done: Boolean(
        bundle &&
          ["prepared", "awaiting_client_approval", "approved", "hmrc_submitted", "complete"].includes(bundle.order.status),
      ),
    },
    {
      id: "approve",
      label: "Client approval",
      done: Boolean(bundle && ["approved", "hmrc_submitted", "complete"].includes(bundle.order.status)),
    },
    {
      id: "file",
      label: "HMRC filing",
      done: Boolean(bundle && ["hmrc_submitted", "complete"].includes(bundle.order.status)),
    },
  ];
  const firstOpen = steps.findIndex((step) => !step.done);
  return steps.map((step, index) => ({
    id: step.id,
    label: step.label,
    state: step.done ? "done" : index === firstOpen ? "current" : "upcoming",
  }));
}

export function nextTaxYear(current: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(current);
  if (!match) return "2026-27";
  const start = Number(match[1]) + 1;
  return `${start}-${String((Number(match[2]) + 1) % 100).padStart(2, "0")}`;
}
