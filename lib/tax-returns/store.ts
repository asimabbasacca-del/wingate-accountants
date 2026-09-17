import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { STORE_PATH, DATA_DIR } from "./paths";
import { hashPassword, nowIso } from "./crypto";
import { hashSecret } from "./mail";
import { FIRM_ID, TAX_YEAR, EMPTY_ANSWERS } from "./types";
import { calculateEstimate } from "./tax-calculation";
import { classifyDocument } from "./intelligence";
import { buildMail, MAIL_COPY } from "./mail";
import { loadDumpFromPostgres, saveDumpToPostgres } from "./pg-store";
import type {
  AMLVerification,
  AccountantNote,
  AuthToken,
  AuthTokenKind,
  DatabaseDump,
  EngagementLetter,
  HMRCSubmission,
  ListedOrder,
  MailLog,
  OrderBundle,
  PortalMessage,
  QuestionnaireAnswers,
  Reminder,
  ReminderKind,
  StoredFile,
  TaxDocument,
  TaxQuestionnaire,
  TaxReturnOrder,
  TaxSummary,
  User,
} from "./types";

const DEMO_CLIENT_EMAIL = "client@wingateaccountants.co.uk";
const DEMO_STAFF_EMAIL = "accountant@wingateaccountants.co.uk";

function emptyDump(): DatabaseDump {
  return {
    users: [],
    orders: [],
    aml: [],
    letters: [],
    questionnaires: [],
    documents: [],
    notes: [],
    messages: [],
    submissions: [],
    files: [],
    authTokens: [],
    mailLogs: [],
    reminders: [],
  };
}

function migrateUser(raw: Partial<User> & Pick<User, "id" | "firmId" | "email" | "passwordHash" | "name" | "role" | "createdAt">): User {
  const parts = String(raw.name || "").trim().split(/\s+/);
  return {
    id: raw.id,
    firmId: raw.firmId,
    email: raw.email,
    passwordHash: raw.passwordHash,
    name: raw.name,
    firstName: raw.firstName || parts[0] || "Client",
    lastName: raw.lastName || parts.slice(1).join(" ") || "",
    mobile: raw.mobile || "",
    role: raw.role,
    emailVerified: raw.emailVerified ?? true,
    emailVerifiedAt: raw.emailVerifiedAt ?? raw.createdAt,
    termsAcceptedAt: raw.termsAcceptedAt ?? raw.createdAt,
    privacyAcceptedAt: raw.privacyAcceptedAt ?? raw.createdAt,
    twoFactorEnabled: Boolean(raw.twoFactorEnabled),
    twoFactorSecret: raw.twoFactorSecret ?? null,
    createdAt: raw.createdAt,
  };
}

function migrateDump(dump: DatabaseDump): DatabaseDump {
  dump.authTokens ??= [];
  dump.mailLogs ??= [];
  dump.reminders ??= [];
  dump.users = dump.users.map((user) => migrateUser(user));
  dump.documents = dump.documents.map((doc) => {
    if (doc.classifiedAs) return doc;
    const classified = classifyDocument(doc.fileName, "");
    return {
      ...doc,
      classifiedAs: classified.label,
      classificationConfidence: classified.confidence,
    };
  });
  return dump;
}

class TaxReturnsStore {
  private data: DatabaseDump | null = null;
  private queue: Promise<void> = Promise.resolve();

  private async load(): Promise<DatabaseDump> {
    if (this.data) return this.data;
    const remote = await loadDumpFromPostgres();
    if (remote.ok && remote.dump) {
      this.data = migrateDump(remote.dump);
      if (!this.data.users.length) {
        this.data = this.seed(this.data);
        await this.persist();
      }
      await this.ensurePracticeRoles();
      return this.data;
    }
    if (remote.ok && !remote.dump) {
      this.data = this.seed(emptyDump());
      await this.persist();
      await this.ensurePracticeRoles();
      return this.data;
    }
    try {
      const raw = await readFile(STORE_PATH, "utf8");
      this.data = migrateDump(JSON.parse(raw) as DatabaseDump);
    } catch {
      this.data = this.seed(emptyDump());
      await this.persist();
    }
    if (!this.data.users.length) {
      this.data = this.seed(this.data);
      await this.persist();
    }
    this.data = migrateDump(this.data);
    await this.ensurePracticeRoles();
    return this.data;
  }

  private async ensurePracticeRoles(): Promise<void> {
    if (!this.data) return;
    const extras: Array<{ id: string; email: string; password: string; name: string; firstName: string; lastName: string; role: User["role"] }> = [
      { id: "usr_super", email: "super@wingateaccountants.co.uk", password: "WingateSuper2026", name: "Morgan Ellis", firstName: "Morgan", lastName: "Ellis", role: "super_admin" },
      { id: "usr_admin", email: "admin@wingateaccountants.co.uk", password: "WingateAdmin2026", name: "Jamie Cole", firstName: "Jamie", lastName: "Cole", role: "admin" },
      { id: "usr_marketing", email: "marketing@wingateaccountants.co.uk", password: "WingateMarketing2026", name: "Riley Shah", firstName: "Riley", lastName: "Shah", role: "marketing" },
      { id: "usr_developer", email: "developer@wingateaccountants.co.uk", password: "WingateDev2026", name: "Taylor Ng", firstName: "Taylor", lastName: "Ng", role: "developer" },
    ];
    let added = false;
    const createdAt = nowIso();
    for (const extra of extras) {
      if (this.data.users.some((user) => user.email === extra.email)) continue;
      this.data.users.push({
        id: extra.id,
        firmId: FIRM_ID,
        email: extra.email,
        passwordHash: hashPassword(extra.password),
        name: extra.name,
        firstName: extra.firstName,
        lastName: extra.lastName,
        mobile: "01615 314179",
        role: extra.role,
        emailVerified: true,
        emailVerifiedAt: createdAt,
        termsAcceptedAt: createdAt,
        privacyAcceptedAt: createdAt,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt,
      });
      added = true;
    }
    if (added) await this.persist();
  }

  private seed(dump: DatabaseDump): DatabaseDump {
    const createdAt = nowIso();
    const accountant: User = {
      id: "usr_accountant",
      firmId: FIRM_ID,
      email: DEMO_STAFF_EMAIL,
      passwordHash: hashPassword("WingateStaff2026"),
      name: "Alex Rahman CTA",
      firstName: "Alex",
      lastName: "Rahman",
      mobile: "01615 314179",
      role: "accountant",
      emailVerified: true,
      emailVerifiedAt: createdAt,
      termsAcceptedAt: createdAt,
      privacyAcceptedAt: createdAt,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      createdAt,
    };
    const client: User = {
      id: "usr_client",
      firmId: FIRM_ID,
      email: DEMO_CLIENT_EMAIL,
      passwordHash: hashPassword("WingateClient2026"),
      name: "Jordan Hale",
      firstName: "Jordan",
      lastName: "Hale",
      mobile: "07700 900123",
      role: "client",
      emailVerified: true,
      emailVerifiedAt: createdAt,
      termsAcceptedAt: createdAt,
      privacyAcceptedAt: createdAt,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      createdAt,
    };
    const orderId = "ord_demo_jordan";
    const answers: QuestionnaireAnswers = {
      ...EMPTY_ANSWERS,
      firstName: "Jordan",
      lastName: "Hale",
      nino: "AB123456C",
      dateOfBirth: "1991-04-12",
      addressLine1: "14 Quay Street",
      city: "Manchester",
      postcode: "M3 3HN",
      ukResident: true,
      maritalStatus: "single",
      hasEmployment: true,
      employerName: "Northern Digital Ltd",
      employmentPay: 38500,
      employmentTaxDeducted: 5280,
      hasSelfEmployment: true,
      tradingName: "Hale Design",
      selfEmploymentTurnover: 14200,
      selfEmploymentExpenses: 2100,
      hasCis: false,
      hasRental: false,
      hasInvestments: true,
      dividends: 800,
      cryptoGains: 0,
      shareGains: 0,
      hasCgt: false,
      hasForeign: false,
      pensionContributions: 2400,
      giftAid: 200,
      marriageAllowance: false,
    };
      const order: TaxReturnOrder = {
        id: orderId,
        firmId: FIRM_ID,
        userId: client.id,
        accountantId: accountant.id,
      taxYear: TAX_YEAR,
      planId: "optimised",
      status: "accountant_review",
      amountGbp: 479,
      payment: { provider: "mock", status: "paid", sessionId: "sess_demo", paidAt: createdAt },
      taxSummary: null,
      createdAt,
      updatedAt: createdAt,
    };
    dump.users = [accountant, client];
    dump.orders = [order];
    dump.aml = [
      {
        id: "aml_demo",
        firmId: FIRM_ID,
        orderId,
        userId: client.id,
        idDocument: { kind: "passport", fileId: "file_placeholder_id", fileName: "passport-photo.jpg" },
        proofsOfAddress: [
          { kind: "bank_statement", fileId: "file_placeholder_poa1", fileName: "bank-july.pdf", dated: "2026-07-01" },
          { kind: "council_tax", fileId: "file_placeholder_poa2", fileName: "council-tax.pdf", dated: "2026-06-15" },
        ],
        selfie: { kind: "selfie", fileId: "file_placeholder_selfie", fileName: "selfie.jpg" },
        status: "approved",
        riskBand: "low",
        staffNotes: "Demo pack — identity and two proofs of address on file.",
        submittedAt: createdAt,
        reviewedAt: createdAt,
      },
    ];
    dump.letters = [
      {
        id: "ltr_demo",
        firmId: FIRM_ID,
        orderId,
        status: "signed",
        pdfFileId: null,
        signerName: "Jordan Hale",
        signatureDataUrl: null,
        signedAt: createdAt,
        generatedAt: createdAt,
      },
    ];
    dump.questionnaires = [
      {
        id: "q_demo",
        firmId: FIRM_ID,
        orderId,
        answers,
        estimate: calculateEstimate(answers),
        currentSection: "estimate",
        completedAt: createdAt,
      },
    ];
    dump.documents = [
      {
        id: "doc_demo_p60",
        firmId: FIRM_ID,
        orderId,
        kind: "p60",
        fileId: "file_placeholder_p60",
        fileName: "P60-2026.pdf",
        uploadedAt: createdAt,
        requested: false,
        classifiedAs: "Employment (P60)",
        classificationConfidence: "high",
      },
    ];
    dump.notes = [
      {
        id: "note_demo",
        firmId: FIRM_ID,
        orderId,
        authorId: accountant.id,
        kind: "note",
        body: "PAYE and freelance design income look consistent. Waiting on CIS confirmation — client says none.",
        createdAt,
      },
    ];
    dump.messages = [
      {
        id: "msg_demo",
        firmId: FIRM_ID,
        orderId,
        authorId: accountant.id,
        authorRole: "accountant",
        body: "Thanks Jordan — I have your questionnaire. If you have a P60 for Northern Digital, upload it here and I will finish the review.",
        createdAt,
      },
    ];
    dump.submissions = [
      {
        id: "hmrc_demo",
        firmId: FIRM_ID,
        orderId,
        mode: "mock",
        status: "not_submitted",
        receiptId: null,
        submittedAt: null,
        sa100FileId: null,
        sa302FileId: null,
        detail: "Not yet filed with HMRC.",
      },
    ];
    dump.files = [];
    dump.authTokens = [];
    dump.mailLogs = [];
    dump.reminders = [
      {
        id: "rem_demo_renewal",
        firmId: FIRM_ID,
        userId: client.id,
        orderId,
        kind: "renewal",
        sendAt: "2027-03-01T09:00:00.000Z",
        sentAt: null,
        subject: MAIL_COPY.renewalSubject,
        body: "Your 2025–26 Self Assessment is on file. We will email you in March 2027 when 2026–27 can be started in the portal.",
      },
    ];
    return dump;
  }

  private async persist(): Promise<void> {
    if (!this.data) return;
    if (await saveDumpToPostgres(this.data)) return;
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${STORE_PATH}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(this.data, null, 2));
    await rename(tmp, STORE_PATH);
  }

  private async mutate<T>(fn: (data: DatabaseDump) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const data = await this.load();
      const result = fn(data);
      await this.persist();
      return result;
    });
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async getUser(id: string): Promise<User | null> {
    const data = await this.load();
    return data.users.find((user) => user.id === id && user.firmId === FIRM_ID) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const data = await this.load();
    return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.firmId === FIRM_ID) ?? null;
  }

  async createUser(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    mobile: string;
    role?: User["role"];
    emailVerified?: boolean;
  }): Promise<User> {
    return this.mutate((data) => {
      const existing = data.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
      if (existing) throw new Error("An account with that email already exists");
      const createdAt = nowIso();
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const user: User = {
        id: `usr_${randomUUID()}`,
        firmId: FIRM_ID,
        email: input.email.toLowerCase().trim(),
        passwordHash: hashPassword(input.password),
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        mobile: input.mobile.trim(),
        role: input.role ?? "client",
        emailVerified: Boolean(input.emailVerified),
        emailVerifiedAt: input.emailVerified ? createdAt : null,
        termsAcceptedAt: createdAt,
        privacyAcceptedAt: createdAt,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        createdAt,
      };
      data.users.push(user);
      return user;
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.mutate((data) => {
      const index = data.users.findIndex((row) => row.id === user.id && row.firmId === FIRM_ID);
      if (index < 0) throw new Error("Account not found");
      data.users[index] = user;
      return user;
    });
  }

  async setPassword(userId: string, password: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("Account not found");
    return this.saveUser({ ...user, passwordHash: hashPassword(password) });
  }

  async markEmailVerified(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("Account not found");
    return this.saveUser({ ...user, emailVerified: true, emailVerifiedAt: nowIso() });
  }

  async addAuthToken(input: {
    userId: string;
    kind: AuthTokenKind;
    tokenHash: string;
    codeHash: string;
    expiresAt: string;
    rememberMe?: boolean;
  }): Promise<AuthToken> {
    return this.mutate((data) => {
      data.authTokens = data.authTokens.filter(
        (token) => !(token.userId === input.userId && token.kind === input.kind && !token.usedAt),
      );
      const token: AuthToken = {
        id: `tok_${randomUUID()}`,
        firmId: FIRM_ID,
        userId: input.userId,
        kind: input.kind,
        tokenHash: input.tokenHash,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
        usedAt: null,
        rememberMe: Boolean(input.rememberMe),
      };
      data.authTokens.push(token);
      return token;
    });
  }

  async consumeAuthSecret(kind: AuthTokenKind, secret: string): Promise<AuthToken | null> {
    const hashed = hashSecret(secret);
    return this.mutate((data) => {
      const row = data.authTokens.find(
        (item) =>
          item.kind === kind &&
          !item.usedAt &&
          Date.parse(item.expiresAt) >= Date.now() &&
          (item.tokenHash === hashed || item.codeHash === hashed),
      );
      if (!row) return null;
      row.usedAt = nowIso();
      return row;
    });
  }

  async addMail(input: Omit<MailLog, "id" | "firmId" | "createdAt">): Promise<MailLog> {
    return this.mutate((data) => {
      const mail = buildMail(input);
      data.mailLogs.unshift(mail);
      data.mailLogs = data.mailLogs.slice(0, 200);
      return mail;
    });
  }

  async latestMailFor(email: string, kind?: string): Promise<MailLog | null> {
    const data = await this.load();
    return (
      data.mailLogs.find(
        (item) => item.to.toLowerCase() === email.toLowerCase() && (!kind || item.kind === kind),
      ) ?? null
    );
  }

  async addReminder(input: {
    userId: string;
    orderId?: string | null;
    kind: ReminderKind;
    sendAt: string;
    subject: string;
    body: string;
  }): Promise<Reminder> {
    return this.mutate((data) => {
      const reminder: Reminder = {
        id: `rem_${randomUUID()}`,
        firmId: FIRM_ID,
        userId: input.userId,
        orderId: input.orderId ?? null,
        kind: input.kind,
        sendAt: input.sendAt,
        sentAt: null,
        subject: input.subject,
        body: input.body,
      };
      data.reminders.push(reminder);
      return reminder;
    });
  }

  async processReminders(): Promise<MailLog[]> {
    const sent: MailLog[] = [];
    await this.mutate((data) => {
      const now = Date.now();
      for (const reminder of data.reminders) {
        if (reminder.sentAt || Date.parse(reminder.sendAt) > now) continue;
        const user = data.users.find((item) => item.id === reminder.userId);
        if (!user) continue;
        reminder.sentAt = nowIso();
        const mail = buildMail({
          to: user.email,
          subject: reminder.subject,
          body: reminder.body,
          kind: `reminder_${reminder.kind}`,
          relatedUserId: user.id,
          relatedOrderId: reminder.orderId ?? undefined,
        });
        data.mailLogs.unshift(mail);
        sent.push(mail);
      }
    });
    return sent;
  }

  async createOrder(userId: string): Promise<TaxReturnOrder> {
    return this.mutate((data) => {
      const open = data.orders.find((order) => order.userId === userId && order.firmId === FIRM_ID && order.status !== "complete");
      if (open) return open;
      const accountant = data.users.find((user) => user.role === "accountant" && user.firmId === FIRM_ID);
      const createdAt = nowIso();
      const order: TaxReturnOrder = {
        id: `ord_${randomUUID()}`,
        firmId: FIRM_ID,
        userId,
        accountantId: accountant?.id ?? null,
        taxYear: TAX_YEAR,
        planId: null,
        status: "account_created",
        amountGbp: 0,
        payment: { provider: "mock", status: "unpaid", sessionId: null, paidAt: null },
        taxSummary: null,
        createdAt,
        updatedAt: createdAt,
      };
      data.orders.push(order);
      data.aml.push({
        id: `aml_${randomUUID()}`,
        firmId: FIRM_ID,
        orderId: order.id,
        userId,
        idDocument: null,
        proofsOfAddress: [],
        selfie: null,
        status: "not_started",
        riskBand: "medium",
        staffNotes: "",
        submittedAt: null,
        reviewedAt: null,
      });
      data.letters.push({
        id: `ltr_${randomUUID()}`,
        firmId: FIRM_ID,
        orderId: order.id,
        status: "draft",
        pdfFileId: null,
        signerName: null,
        signatureDataUrl: null,
        signedAt: null,
        generatedAt: null,
      });
      data.questionnaires.push({
        id: `q_${randomUUID()}`,
        firmId: FIRM_ID,
        orderId: order.id,
        answers: { ...EMPTY_ANSWERS },
        estimate: null,
        currentSection: "personal",
        completedAt: null,
      });
      data.submissions.push({
        id: `hmrc_${randomUUID()}`,
        firmId: FIRM_ID,
        orderId: order.id,
        mode: "mock",
        status: "not_submitted",
        receiptId: null,
        submittedAt: null,
        sa100FileId: null,
        sa302FileId: null,
        detail: "Not yet filed with HMRC. MTD filing for Income Tax is in development — this portal stores a receipt when a mock or live submission is recorded.",
      });
      return order;
    });
  }

  async saveOrder(order: TaxReturnOrder): Promise<TaxReturnOrder> {
    return this.mutate((data) => {
      const index = data.orders.findIndex((row) => row.id === order.id && row.firmId === FIRM_ID);
      if (index < 0) throw new Error("Order not found");
      const next = { ...order, updatedAt: nowIso() };
      data.orders[index] = next;
      return next;
    });
  }

  async getOrder(id: string): Promise<TaxReturnOrder | null> {
    const data = await this.load();
    return data.orders.find((order) => order.id === id && order.firmId === FIRM_ID) ?? null;
  }

  async ordersForUser(userId: string): Promise<TaxReturnOrder[]> {
    const data = await this.load();
    return data.orders.filter((order) => order.userId === userId && order.firmId === FIRM_ID);
  }

  async allOrders(): Promise<TaxReturnOrder[]> {
    const data = await this.load();
    return data.orders.filter((order) => order.firmId === FIRM_ID);
  }

  async getAml(orderId: string): Promise<AMLVerification | null> {
    const data = await this.load();
    return data.aml.find((row) => row.orderId === orderId && row.firmId === FIRM_ID) ?? null;
  }

  async saveAml(row: AMLVerification): Promise<AMLVerification> {
    return this.mutate((data) => {
      const index = data.aml.findIndex((item) => item.id === row.id && item.firmId === FIRM_ID);
      if (index < 0) throw new Error("AML record not found");
      data.aml[index] = row;
      return row;
    });
  }

  async getLetter(orderId: string): Promise<EngagementLetter | null> {
    const data = await this.load();
    return data.letters.find((row) => row.orderId === orderId && row.firmId === FIRM_ID) ?? null;
  }

  async saveLetter(row: EngagementLetter): Promise<EngagementLetter> {
    return this.mutate((data) => {
      const index = data.letters.findIndex((item) => item.id === row.id && item.firmId === FIRM_ID);
      if (index < 0) throw new Error("Letter not found");
      data.letters[index] = row;
      return row;
    });
  }

  async getQuestionnaire(orderId: string): Promise<TaxQuestionnaire | null> {
    const data = await this.load();
    return data.questionnaires.find((row) => row.orderId === orderId && row.firmId === FIRM_ID) ?? null;
  }

  async saveQuestionnaire(row: TaxQuestionnaire): Promise<TaxQuestionnaire> {
    return this.mutate((data) => {
      const index = data.questionnaires.findIndex((item) => item.id === row.id && item.firmId === FIRM_ID);
      if (index < 0) throw new Error("Questionnaire not found");
      data.questionnaires[index] = row;
      return row;
    });
  }

  async documents(orderId: string): Promise<TaxDocument[]> {
    const data = await this.load();
    return data.documents.filter((row) => row.orderId === orderId && row.firmId === FIRM_ID);
  }

  async addDocument(row: TaxDocument): Promise<TaxDocument> {
    return this.mutate((data) => {
      data.documents.push(row);
      return row;
    });
  }

  async notes(orderId: string): Promise<AccountantNote[]> {
    const data = await this.load();
    return data.notes.filter((row) => row.orderId === orderId && row.firmId === FIRM_ID);
  }

  async addNote(row: AccountantNote): Promise<AccountantNote> {
    return this.mutate((data) => {
      data.notes.push(row);
      return row;
    });
  }

  async messages(orderId: string): Promise<PortalMessage[]> {
    const data = await this.load();
    return data.messages.filter((row) => row.orderId === orderId && row.firmId === FIRM_ID);
  }

  async addMessage(row: PortalMessage): Promise<PortalMessage> {
    return this.mutate((data) => {
      data.messages.push(row);
      return row;
    });
  }

  async getSubmission(orderId: string): Promise<HMRCSubmission | null> {
    const data = await this.load();
    return data.submissions.find((row) => row.orderId === orderId && row.firmId === FIRM_ID) ?? null;
  }

  async saveSubmission(row: HMRCSubmission): Promise<HMRCSubmission> {
    return this.mutate((data) => {
      const index = data.submissions.findIndex((item) => item.id === row.id && item.firmId === FIRM_ID);
      if (index < 0) throw new Error("Submission not found");
      data.submissions[index] = row;
      return row;
    });
  }

  async addFile(meta: Omit<StoredFile, "id" | "createdAt" | "firmId"> & { id?: string }): Promise<StoredFile> {
    return this.mutate((data) => {
      const file: StoredFile = {
        id: meta.id ?? `file_${randomUUID()}`,
        firmId: FIRM_ID,
        orderId: meta.orderId,
        originalName: meta.originalName,
        mimeType: meta.mimeType,
        size: meta.size,
        createdAt: nowIso(),
      };
      data.files.push(file);
      return file;
    });
  }

  async getFile(id: string): Promise<StoredFile | null> {
    const data = await this.load();
    return data.files.find((file) => file.id === id && file.firmId === FIRM_ID) ?? null;
  }

  async setTaxSummary(orderId: string, summary: TaxSummary): Promise<TaxReturnOrder> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    return this.saveOrder({ ...order, taxSummary: summary });
  }

  async bundle(orderId: string): Promise<OrderBundle | null> {
    const order = await this.getOrder(orderId);
    if (!order) return null;
    const client = await this.getUser(order.userId);
    const accountant =
      (order.accountantId ? await this.getUser(order.accountantId) : null) ??
      (await this.defaultAccountant());
    const person = (user: User | null) =>
      user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
    return {
      order,
      aml: await this.getAml(orderId),
      letter: await this.getLetter(orderId),
      questionnaire: await this.getQuestionnaire(orderId),
      documents: await this.documents(orderId),
      notes: await this.notes(orderId),
      messages: await this.messages(orderId),
      submission: await this.getSubmission(orderId),
      client: person(client),
      accountant: person(accountant),
    };
  }

  async allUsers(): Promise<User[]> {
    const data = await this.load();
    return data.users.filter((user) => user.firmId === FIRM_ID);
  }

  async listMail(userId?: string): Promise<MailLog[]> {
    const data = await this.load();
    if (!userId) return data.mailLogs;
    return data.mailLogs.filter((row) => row.relatedUserId === userId || row.to === (data.users.find((u) => u.id === userId)?.email));
  }

  async defaultAccountant(): Promise<User | null> {
    const data = await this.load();
    return data.users.find((user) => user.role === "accountant" && user.firmId === FIRM_ID) ?? null;
  }

  async listedOrders(): Promise<ListedOrder[]> {
    const orders = await this.allOrders();
    const listed = [];
    for (const order of orders) {
      const client = await this.getUser(order.userId);
      listed.push({
        ...order,
        clientName: client?.name ?? "Client",
        clientEmail: client?.email ?? "",
      });
    }
    return listed;
  }
}

export const store = new TaxReturnsStore();
export const DEMO_LOGINS = {
  client: { email: DEMO_CLIENT_EMAIL, password: "WingateClient2026" },
  accountant: { email: DEMO_STAFF_EMAIL, password: "WingateStaff2026" },
};
