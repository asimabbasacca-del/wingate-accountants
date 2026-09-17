export const FIRM_ID = "wingate-accountants-ltd";
export const TAX_YEAR = "2025-26";
export const MODULE_NAME = "wingate_tax_returns";

export type UserRole =
  | "super_admin"
  | "admin"
  | "staff"
  | "accountant"
  | "marketing"
  | "developer"
  | "client";

export type PlanId = "prepared" | "optimised" | "partner";

export type OrderStatus =
  | "account_created"
  | "plan_selected"
  | "payment_pending"
  | "paid"
  | "aml_pending"
  | "aml_submitted"
  | "engagement_pending"
  | "engagement_signed"
  | "questionnaire_in_progress"
  | "questionnaire_complete"
  | "documents_pending"
  | "accountant_review"
  | "info_requested"
  | "prepared"
  | "awaiting_client_approval"
  | "approved"
  | "hmrc_submitted"
  | "complete";

export type AmlStatus = "not_started" | "submitted" | "under_review" | "approved" | "rejected";
export type LetterStatus = "draft" | "generated" | "signed";
export type PaymentProvider = "stripe" | "mock";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";
export type IdDocumentKind = "passport" | "driving_licence";
export type AddressDocumentKind = "bank_statement" | "utility_bill" | "council_tax" | "government_letter";
export type TaxDocumentKind =
  | "p60"
  | "p45"
  | "sa302"
  | "bank_statement"
  | "invoice"
  | "rental_spreadsheet"
  | "other";

export type User = {
  id: string;
  firmId: string;
  email: string;
  passwordHash: string;
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  createdAt: string;
};

export type AuthTokenKind = "email_verify" | "password_reset" | "two_factor";

export type AuthToken = {
  id: string;
  firmId: string;
  userId: string;
  kind: AuthTokenKind;
  tokenHash: string;
  codeHash: string;
  expiresAt: string;
  usedAt: string | null;
  rememberMe: boolean;
};

export type MailLog = {
  id: string;
  firmId: string;
  to: string;
  subject: string;
  body: string;
  kind: string;
  createdAt: string;
  relatedUserId?: string;
  relatedOrderId?: string;
};

export type ReminderKind = "verify_email" | "outstanding_task" | "renewal";

export type Reminder = {
  id: string;
  firmId: string;
  userId: string;
  orderId: string | null;
  kind: ReminderKind;
  sendAt: string;
  sentAt: string | null;
  subject: string;
  body: string;
};

export type StoredFile = {
  id: string;
  firmId: string;
  orderId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type DirectoryPerson = Pick<User, "id" | "name" | "email" | "role">;

export type TaxReturnOrder = {
  id: string;
  firmId: string;
  userId: string;
  accountantId: string | null;
  taxYear: string;
  planId: PlanId | null;
  status: OrderStatus;
  amountGbp: number;
  payment: {
    provider: PaymentProvider;
    status: PaymentStatus;
    sessionId: string | null;
    paidAt: string | null;
  };
  taxSummary: TaxSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type AmlDocument = {
  kind: string;
  fileId: string;
  fileName: string;
  dated?: string;
};

export type AMLVerification = {
  id: string;
  firmId: string;
  orderId: string;
  userId: string;
  idDocument: AmlDocument | null;
  proofsOfAddress: AmlDocument[];
  selfie: AmlDocument | null;
  status: AmlStatus;
  riskBand: "low" | "medium" | "high";
  staffNotes: string;
  submittedAt: string | null;
  reviewedAt: string | null;
};

export type EngagementLetter = {
  id: string;
  firmId: string;
  orderId: string;
  status: LetterStatus;
  pdfFileId: string | null;
  signerName: string | null;
  signatureDataUrl: string | null;
  signedAt: string | null;
  generatedAt: string | null;
};

export type QuestionnaireAnswers = {
  firstName: string;
  lastName: string;
  nino: string;
  dateOfBirth: string;
  addressLine1: string;
  city: string;
  postcode: string;
  ukResident: boolean | null;
  maritalStatus: string;
  hasEmployment: boolean | null;
  employmentPay: number;
  employmentTaxDeducted: number;
  employerName: string;
  hasSelfEmployment: boolean | null;
  tradingName: string;
  selfEmploymentTurnover: number;
  selfEmploymentExpenses: number;
  hasCis: boolean | null;
  cisGross: number;
  cisTaxDeducted: number;
  hasRental: boolean | null;
  rentalIncome: number;
  rentalExpenses: number;
  hasInvestments: boolean | null;
  dividends: number;
  cryptoGains: number;
  shareGains: number;
  hasCgt: boolean | null;
  otherCgtGains: number;
  cgtLosses: number;
  hasForeign: boolean | null;
  foreignIncome: number;
  pensionContributions: number;
  giftAid: number;
  marriageAllowance: boolean;
};

export type TaxEstimate = {
  totalIncome: number;
  taxableIncome: number;
  incomeTax: number;
  class4Ni: number;
  cgt: number;
  taxAlreadyPaid: number;
  estimatedLiability: number;
  estimatedRefund: number;
  netPosition: number;
  notes: string[];
};

export type TaxQuestionnaire = {
  id: string;
  firmId: string;
  orderId: string;
  answers: QuestionnaireAnswers;
  estimate: TaxEstimate | null;
  currentSection: string;
  completedAt: string | null;
};

export type TaxDocument = {
  id: string;
  firmId: string;
  orderId: string;
  kind: TaxDocumentKind;
  fileId: string;
  fileName: string;
  uploadedAt: string;
  requested: boolean;
  classifiedAs: string;
  classificationConfidence: "high" | "medium" | "low";
};

export type AccountantNote = {
  id: string;
  firmId: string;
  orderId: string;
  authorId: string;
  kind: "note" | "info_request";
  body: string;
  createdAt: string;
};

export type PortalMessage = {
  id: string;
  firmId: string;
  orderId: string;
  authorId: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
};

export type HMRCSubmission = {
  id: string;
  firmId: string;
  orderId: string;
  mode: "live" | "mock";
  status: "not_submitted" | "submitted";
  receiptId: string | null;
  submittedAt: string | null;
  sa100FileId: string | null;
  sa302FileId: string | null;
  detail: string;
};

export type TaxSummary = {
  preparedAt: string;
  preparedBy: string;
  totalIncome: number;
  taxDue: number;
  refundDue: number;
  narrative: string;
};

export type DatabaseDump = {
  users: User[];
  orders: TaxReturnOrder[];
  aml: AMLVerification[];
  letters: EngagementLetter[];
  questionnaires: TaxQuestionnaire[];
  documents: TaxDocument[];
  notes: AccountantNote[];
  messages: PortalMessage[];
  submissions: HMRCSubmission[];
  files: StoredFile[];
  authTokens: AuthToken[];
  mailLogs: MailLog[];
  reminders: Reminder[];
};

export type PublicUser = Omit<User, "passwordHash" | "twoFactorSecret">;

export type OutstandingTask = {
  id: string;
  label: string;
  href: string;
};

export type InvoiceView = {
  id: string;
  description: string;
  amountGbp: number;
  status: PaymentStatus;
  paidAt: string | null;
};

export type OrderBundle = {
  order: TaxReturnOrder;
  aml: AMLVerification | null;
  letter: EngagementLetter | null;
  questionnaire: TaxQuestionnaire | null;
  documents: TaxDocument[];
  notes: AccountantNote[];
  messages: PortalMessage[];
  submission: HMRCSubmission | null;
  client: DirectoryPerson | null;
  accountant: DirectoryPerson | null;
};

export type ListedOrder = TaxReturnOrder & {
  clientName: string;
  clientEmail: string;
};

export const EMPTY_ANSWERS: QuestionnaireAnswers = {
  firstName: "",
  lastName: "",
  nino: "",
  dateOfBirth: "",
  addressLine1: "",
  city: "",
  postcode: "",
  ukResident: null,
  maritalStatus: "",
  hasEmployment: null,
  employmentPay: 0,
  employmentTaxDeducted: 0,
  employerName: "",
  hasSelfEmployment: null,
  tradingName: "",
  selfEmploymentTurnover: 0,
  selfEmploymentExpenses: 0,
  hasCis: null,
  cisGross: 0,
  cisTaxDeducted: 0,
  hasRental: null,
  rentalIncome: 0,
  rentalExpenses: 0,
  hasInvestments: null,
  dividends: 0,
  cryptoGains: 0,
  shareGains: 0,
  hasCgt: null,
  otherCgtGains: 0,
  cgtLosses: 0,
  hasForeign: null,
  foreignIncome: 0,
  pensionContributions: 0,
  giftAid: 0,
  marriageAllowance: false,
};
