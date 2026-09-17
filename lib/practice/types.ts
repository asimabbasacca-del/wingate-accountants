import type { UserRole } from "@/lib/tax-returns/types";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "client";
export type LeadSource = "website" | "referral" | "google" | "facebook" | "linkedin" | "direct";
export type InvoiceStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type JobStatus =
  | "paid"
  | "waiting_documents"
  | "documents_received"
  | "in_progress"
  | "draft_complete"
  | "sent_to_client"
  | "completed";
export type DeadlineKind =
  | "self_assessment"
  | "corporation_tax"
  | "vat_return"
  | "vat_payment"
  | "paye"
  | "cis"
  | "confirmation_statement"
  | "cgt"
  | "annual_accounts";
export type DeadlineStatus = "upcoming" | "due_soon" | "overdue" | "completed";
export type PromoKind = "percent" | "fixed";
export type AutomationAction =
  | "create_client"
  | "create_job"
  | "send_email"
  | "send_engagement_letter"
  | "request_documents"
  | "create_folder"
  | "assign_staff"
  | "change_status"
  | "create_tasks"
  | "schedule_reminders";

export type CmsPage = {
  id: string;
  firmId: string;
  slug: string;
  kind: "home" | "page" | "post" | "faq" | "testimonial" | "banner";
  title: string;
  seoTitle: string;
  description: string;
  html: string;
  published: boolean;
  updatedAt: string;
  updatedBy: string;
};

export type AuditEvent = {
  id: string;
  firmId: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
};

export type PracticeInvoice = {
  id: string;
  firmId: string;
  number: string;
  userId: string | null;
  email: string;
  packageId: string;
  packageName: string;
  amountGbp: number;
  currency: "gbp";
  status: InvoiceStatus;
  stripePaymentId: string | null;
  stripeCustomerId: string | null;
  stripeSessionId: string | null;
  promoCode: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type PracticeSubscription = {
  id: string;
  firmId: string;
  userId: string | null;
  email: string;
  packageId: string;
  interval: "month" | "quarter" | "year";
  status: "active" | "paused" | "cancelled";
  stripeSubscriptionId: string | null;
  createdAt: string;
};

export type PromoCode = {
  id: string;
  firmId: string;
  code: string;
  kind: PromoKind;
  amount: number;
  expiresAt: string | null;
  usageLimit: number | null;
  used: number;
  packageIds: string[];
  active: boolean;
};

export type Lead = {
  id: string;
  firmId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  serviceInterest: string;
  notes: string;
  source: LeadSource;
  status: LeadStatus;
  ownerId: string | null;
  createdAt: string;
  activities: { at: string; text: string }[];
};

export type PracticeJob = {
  id: string;
  firmId: string;
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
  status: JobStatus;
  assignedStaffId: string | null;
  progress: number;
  stages: { id: string; label: string; done: boolean; at: string | null }[];
  notes: string;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HmrcDeadline = {
  id: string;
  firmId: string;
  clientId: string | null;
  clientName: string;
  kind: DeadlineKind;
  dueAt: string;
  status: DeadlineStatus;
  lastReminderAt: string | null;
  remindersSent: number[];
};

export type AutomationStep = {
  id: string;
  action: AutomationAction;
  label: string;
  delayHours: number;
};

export type AutomationRule = {
  id: string;
  firmId: string;
  name: string;
  packageId: string | "all";
  steps: AutomationStep[];
  active: boolean;
};

export type AmlDocStatus = "missing" | "uploaded" | "accepted" | "rejected";

export type AmlCase = {
  id: string;
  firmId: string;
  clientId: string;
  clientName: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  risk: "low" | "medium" | "high";
  pep: boolean;
  sanctions: boolean;
  questionnaire: Record<string, string>;
  questionnaireAt: string | null;
  idDocumentStatus: AmlDocStatus;
  poaStatus: AmlDocStatus;
  selfieStatus: AmlDocStatus;
  faceMatchConfirmed: boolean;
  staffNotes: string;
  matchScore: number | null;
  reviewDueAt: string;
  staffId: string | null;
};

export type ClientProfile = {
  userId: string;
  phone: string;
  niNumber: string;
  utr: string;
  dateOfBirth: string;
  addressLine: string;
  postcode: string;
  companyName: string;
  companyNumber: string;
  vatNumber: string;
  updatedAt: string;
};

export type AbandonedCheckout = {
  id: string;
  firmId: string;
  name: string;
  email: string;
  packageId: string;
  packageName: string;
  createdAt: string;
  emailedAt: string | null;
};

export type DeviceSession = {
  id: string;
  userId: string;
  label: string;
  createdAt: string;
  lastSeenAt: string;
};

export type PracticeDump = {
  cms: CmsPage[];
  audit: AuditEvent[];
  invoices: PracticeInvoice[];
  subscriptions: PracticeSubscription[];
  promos: PromoCode[];
  leads: Lead[];
  jobs: PracticeJob[];
  deadlines: HmrcDeadline[];
  automations: AutomationRule[];
  aml: AmlCase[];
  abandoned: AbandonedCheckout[];
  devices: DeviceSession[];
  refunds: {
    id: string;
    invoiceId: string;
    amountGbp: number;
    reason: string;
    userId: string;
    createdAt: string;
  }[];
  profiles: ClientProfile[];
  settings: {
    stripeMode: "live" | "test" | "mock";
    cancelPolicy: string;
  };
};

export const PROFILE_FIELDS: { key: keyof ClientProfile; label: string; personal: boolean }[] = [
  { key: "phone", label: "Mobile", personal: true },
  { key: "niNumber", label: "National Insurance number", personal: true },
  { key: "utr", label: "Unique Taxpayer Reference", personal: true },
  { key: "dateOfBirth", label: "Date of birth", personal: true },
  { key: "addressLine", label: "Address", personal: true },
  { key: "postcode", label: "Postcode", personal: true },
  { key: "companyName", label: "Business name", personal: false },
  { key: "companyNumber", label: "Companies House number", personal: false },
  { key: "vatNumber", label: "VAT number", personal: false },
];

export function profileProgress(profile: ClientProfile | undefined): {
  percent: number;
  personalPercent: number;
  businessPercent: number;
  outstanding: string[];
} {
  const personal = PROFILE_FIELDS.filter((row) => row.personal);
  const business = PROFILE_FIELDS.filter((row) => !row.personal);
  const filled = (rows: typeof PROFILE_FIELDS) =>
    rows.filter((row) => Boolean(String(profile?.[row.key] || "").trim())).length;
  const personalFilled = filled(personal);
  const businessFilled = filled(business);
  const outstanding = PROFILE_FIELDS.filter((row) => !String(profile?.[row.key] || "").trim()).map((row) => row.label);
  return {
    percent: Math.round(((personalFilled + businessFilled) / PROFILE_FIELDS.length) * 100),
    personalPercent: Math.round((personalFilled / personal.length) * 100),
    businessPercent: Math.round((businessFilled / business.length) * 100),
    outstanding,
  };
}

export type PublicRoleUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
