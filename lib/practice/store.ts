import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { FIRM_ID } from "@/lib/tax-returns/types";
import { nowIso } from "@/lib/tax-returns/crypto";
import { DATA_DIR } from "@/lib/tax-returns/paths";
import { loadPracticeDump, savePracticeDump } from "./pg";
import type {
  AbandonedCheckout,
  AmlCase,
  AuditEvent,
  AutomationRule,
  ClientProfile,
  CmsPage,
  HmrcDeadline,
  Lead,
  PracticeDump,
  PracticeInvoice,
  PracticeJob,
  PracticeSubscription,
  PromoCode,
} from "./types";

const STORE_PATH = path.join(DATA_DIR, "practice-os.json");

function defaultStages(packageName: string): PracticeJob["stages"] {
  return [
    { id: "paid", label: "Payment received", done: true, at: nowIso() },
    { id: "letter", label: "Engagement letter sent", done: true, at: nowIso() },
    { id: "signed", label: "Engagement letter signed", done: false, at: null },
    { id: "docs_req", label: "Documents requested", done: true, at: nowIso() },
    { id: "docs", label: "Documents received", done: false, at: null },
    { id: "wip", label: "Work in progress", done: false, at: null },
    { id: "draft", label: "Draft complete", done: false, at: null },
    { id: "approve", label: "Awaiting approval", done: false, at: null },
    { id: "hmrc", label: "Submitted to HMRC", done: false, at: null },
    { id: "done", label: "Completed", done: false, at: null },
  ].map((stage, index) => (index === 0 ? stage : { ...stage, label: `${packageName}: ${stage.label}`.replace(/^[^:]+: /, stage.label) }));
}

function cmsPage(
  created: string,
  input: Pick<CmsPage, "id" | "slug" | "kind" | "title"> & Partial<CmsPage>,
): CmsPage {
  return {
    firmId: FIRM_ID,
    seoTitle: input.seoTitle || input.title,
    description: input.description || "",
    html: input.html || "",
    published: input.published !== false,
    updatedAt: created,
    updatedBy: "system",
    ...input,
  };
}

function seedDump(): PracticeDump {
  const created = nowIso();
  const saDue = `${new Date().getFullYear() + (new Date().getMonth() > 0 ? 1 : 0)}-01-31T23:59:00.000Z`;
  return {
    cms: [
      cmsPage(created, {
        id: "cms_home",
        slug: "home",
        kind: "home",
        title: "Chartered accountants for contractors, the self-employed and small businesses",
        seoTitle: "Wingate Accountants Ltd | Chartered Accountants Manchester",
        description: "Fixed-fee accountancy, Self Assessment and tax investigations.",
        html: "Wingate Accountants is a forward-thinking firm of chartered accountants and tax advisors, blending traditional values with a modern approach.",
      }),
      cmsPage(created, {
        id: "cms_services",
        slug: "services",
        kind: "page",
        title: "Accountancy and tax services",
        seoTitle: "Services | Wingate Accountants",
        description: "Fixed-fee packages, Self Assessment, company accounts, VAT and tax investigations.",
        html: "<p>Wingate looks after contractors, landlords, sole traders and limited companies with published prices and a named accountant.</p>",
      }),
      cmsPage(created, {
        id: "cms_tax",
        slug: "self-assessment-tax-returns",
        kind: "page",
        title: "Self Assessment tax returns",
        seoTitle: "Self Assessment tax returns | Wingate Accountants",
        description: "We prepare and file Self Assessment returns for individuals, landlords and the self-employed.",
        html: "<p>Upload your records in the tax portal. We prepare the return, you approve, then we file with HMRC. MTD bridging remains in development.</p>",
      }),
      cmsPage(created, {
        id: "cms_contact",
        slug: "contact-us",
        kind: "page",
        title: "Contact Wingate Accountants",
        seoTitle: "Contact us | Wingate Accountants",
        description: "Write to Wingate Accountants in Manchester. We reply the same working day before 3pm.",
        html: "<p>Use the form on this page. Tell us the service you need and we will match you to a named accountant.</p>",
      }),
      cmsPage(created, {
        id: "cms_packages_landing",
        slug: "accountancy-packages",
        kind: "page",
        title: "Fixed-fee accountancy packages",
        seoTitle: "Accountancy packages | Wingate Accountants",
        description: "Published monthly and annual fees for contractors, landlords, locums and limited companies.",
        html: "<p>Prices on this page come from the live package catalogue. Change a fee in Practice OS and the public site updates without a deploy.</p>",
      }),
      cmsPage(created, {
        id: "cms_faq_vat",
        slug: "faq-vat",
        kind: "faq",
        title: "What does the published package fee include?",
        description: "packages",
        html: "The price on each package card is the fee for the work listed. Add-ons such as formation or a registered office are priced separately.",
      }),
      cmsPage(created, {
        id: "cms_faq_switch",
        slug: "faq-switch",
        kind: "faq",
        title: "Can you take over from my current accountant?",
        description: "packages",
        html: "Yes. We request professional clearance and Companies House / HMRC agent codes, then pick up the next filing.",
      }),
      cmsPage(created, {
        id: "cms_testimonial_1",
        slug: "testimonial-jordan",
        kind: "testimonial",
        title: "Jordan Hale",
        seoTitle: "Freelance designer",
        description: "Self Assessment client",
        html: "Clear fees, a named accountant, and the tax portal meant I was not chasing emails in January.",
      }),
      cmsPage(created, {
        id: "cms_testimonial_2",
        slug: "testimonial-samira",
        kind: "testimonial",
        title: "Samira Khan",
        seoTitle: "Director, Khan Design Ltd",
        description: "Limited company",
        html: "They explained IR35 in plain English and kept Companies House and VAT on the same calendar.",
      }),
      cmsPage(created, {
        id: "cms_banner",
        slug: "home-banner",
        kind: "banner",
        title: "Online Self Assessment is open",
        description: "Start a return without leaving the Wingate site.",
        html: "/online-tax-return-preparation-service/",
      }),
      cmsPage(created, {
        id: "cms_post_mtd",
        slug: "mtd-income-tax-what-wingate-clients-should-know",
        kind: "post",
        title: "MTD for Income Tax: what Wingate clients should know",
        seoTitle: "MTD for Income Tax | Wingate Accountants",
        description: "Making Tax Digital for Income Tax is coming. Wingate will support digital records; bridging software is in development.",
        html: "<p>HMRC’s Making Tax Digital (MTD) programme for Income Tax will require digital records for many sole traders and landlords. We will keep clients on a named-accountant filing path. MTD bridging remains in development — we will not pretend a live HMRC sandbox connection exists until credentials work.</p><p>If you already use Xero or QuickBooks, keep that software. We will map those records into the quarterly updates when the rules apply to you.</p>",
      }),
    ],
    audit: [],
    invoices: [
      {
        id: "inv_demo_jordan",
        firmId: FIRM_ID,
        number: "INV-2026-0001",
        userId: "usr_client",
        email: "client@wingateaccountants.co.uk",
        packageId: "personal-self-assessment",
        packageName: "Personal Self Assessment",
        amountGbp: 250,
        currency: "gbp",
        status: "paid",
        stripePaymentId: "pi_demo",
        stripeCustomerId: "cus_demo",
        stripeSessionId: "sess_demo",
        promoCode: null,
        createdAt: created,
        paidAt: created,
      },
    ],
    subscriptions: [
      {
        id: "sub_demo_books",
        firmId: FIRM_ID,
        userId: "usr_client",
        email: "client@wingateaccountants.co.uk",
        packageId: "self-employed-accounts",
        interval: "month",
        status: "active",
        stripeSubscriptionId: null,
        createdAt: created,
      },
    ],
    promos: [
      {
        id: "promo_tax25",
        firmId: FIRM_ID,
        code: "TAX25",
        kind: "percent",
        amount: 25,
        expiresAt: "2027-01-31T00:00:00.000Z",
        usageLimit: 100,
        used: 0,
        packageIds: [],
        active: true,
      },
      {
        id: "promo_save10",
        firmId: FIRM_ID,
        code: "SAVE10",
        kind: "percent",
        amount: 10,
        expiresAt: null,
        usageLimit: null,
        used: 0,
        packageIds: [],
        active: true,
      },
      {
        id: "promo_new50",
        firmId: FIRM_ID,
        code: "NEWCLIENT50",
        kind: "fixed",
        amount: 50,
        expiresAt: "2026-12-31T00:00:00.000Z",
        usageLimit: 50,
        used: 1,
        packageIds: [],
        active: true,
      },
    ],
    leads: [
      {
        id: "lead_demo",
        firmId: FIRM_ID,
        name: "Samira Khan",
        email: "samira.khan@example.com",
        phone: "07700 900888",
        businessName: "Khan Design Ltd",
        serviceInterest: "Contractor Complete",
        notes: "Asked about IR35 and a named accountant.",
        source: "website",
        status: "contacted",
        ownerId: "usr_accountant",
        createdAt: created,
        activities: [{ at: created, text: "Lead captured from the website contact form." }],
      },
    ],
    jobs: [
      {
        id: "job_demo_jordan",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        packageId: "personal-self-assessment",
        packageName: "Personal Self Assessment",
        status: "in_progress",
        assignedStaffId: "usr_accountant",
        progress: 45,
        stages: defaultStages("Self Assessment").map((stage, i) =>
          i < 5 ? { ...stage, done: true, at: created } : stage,
        ),
        notes: "PAYE and freelance design income look consistent.",
        dueAt: saDue,
        createdAt: created,
        updatedAt: created,
      },
    ],
    deadlines: [
      {
        id: "dl_sa_jordan",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "self_assessment",
        dueAt: saDue,
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      },
      {
        id: "dl_vat_demo",
        firmId: FIRM_ID,
        clientId: null,
        clientName: "Practice VAT (example)",
        kind: "vat_return",
        dueAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: "due_soon",
        lastReminderAt: null,
        remindersSent: [30],
      },
      {
        id: "dl_ct_demo",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "corporation_tax",
        dueAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      },
      {
        id: "dl_paye_demo",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "paye",
        dueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: "due_soon",
        lastReminderAt: null,
        remindersSent: [30, 14],
      },
      {
        id: "dl_cis_demo",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "cis",
        dueAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      },
      {
        id: "dl_cs_demo",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "confirmation_statement",
        dueAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      },
      {
        id: "dl_accounts_demo",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        kind: "annual_accounts",
        dueAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
        lastReminderAt: null,
        remindersSent: [],
      },
    ],
    automations: [
      {
        id: "auto_sa",
        firmId: FIRM_ID,
        name: "Self Assessment onboarding",
        packageId: "personal-self-assessment",
        active: true,
        steps: [
          { id: "s1", action: "create_client", label: "Create client", delayHours: 0 },
          { id: "s2", action: "create_job", label: "Create job", delayHours: 0 },
          { id: "s3", action: "send_email", label: "Send welcome email", delayHours: 0 },
          { id: "s4", action: "send_engagement_letter", label: "Send engagement letter", delayHours: 0 },
          { id: "s5", action: "request_documents", label: "Request documents", delayHours: 1 },
          { id: "s6", action: "create_folder", label: "Create document folder", delayHours: 0 },
          { id: "s7", action: "assign_staff", label: "Assign named accountant", delayHours: 0 },
          { id: "s8", action: "create_tasks", label: "Create onboarding tasks", delayHours: 0 },
          { id: "s9", action: "schedule_reminders", label: "Schedule HMRC reminders", delayHours: 24 },
        ],
      },
    ],
    aml: [
      {
        id: "aml_os_jordan",
        firmId: FIRM_ID,
        clientId: "usr_client",
        clientName: "Jordan Hale",
        status: "approved",
        risk: "low",
        pep: false,
        sanctions: false,
        questionnaire: {
          ukResident: "Yes",
          actingForAnother: "No",
          pep: "No",
          overseasAssets: "No",
          overseasIncome: "No",
          services: "Self Assessment",
          expectedIncome: "£40,000–£60,000",
          sourceOfFunds: "Employment and freelance design",
          sourceOfWealth: "Salary and trading profits",
        },
        questionnaireAt: created,
        idDocumentStatus: "accepted",
        poaStatus: "accepted",
        selfieStatus: "accepted",
        faceMatchConfirmed: true,
        staffNotes: "Photo ID matches the selfie. Staff confirmed — no biometric vendor.",
        matchScore: 92,
        reviewDueAt: "2031-09-14T00:00:00.000Z",
        staffId: "usr_accountant",
      },
    ],
    abandoned: [
      {
        id: "abn_demo",
        firmId: FIRM_ID,
        name: "Samira Khan",
        email: "samira.khan@example.com",
        packageId: "contractor-complete",
        packageName: "Contractor Complete",
        createdAt: created,
        emailedAt: null,
      },
    ],
    devices: [],
    refunds: [],
    profiles: [
      {
        userId: "usr_client",
        phone: "07700 900111",
        niNumber: "QQ123456C",
        utr: "1234567890",
        dateOfBirth: "1992-04-18",
        addressLine: "14 Deansgate",
        postcode: "M3 2GQ",
        companyName: "",
        companyNumber: "",
        vatNumber: "",
        updatedAt: created,
      },
    ],
    settings: {
      stripeMode: process.env.STRIPE_SECRET_KEY ? "test" : "mock",
      cancelPolicy: "Subscriptions can be cancelled at a period end. Refunds are at the firm's discretion.",
    },
  };
}

function migrate(dump: PracticeDump): PracticeDump {
  dump.cms ??= [];
  dump.audit ??= [];
  dump.invoices ??= [];
  dump.subscriptions ??= [];
  dump.promos ??= [];
  dump.leads ??= [];
  dump.jobs ??= [];
  dump.deadlines ??= [];
  dump.automations ??= [];
  dump.aml ??= [];
  dump.abandoned ??= [];
  dump.devices ??= [];
  dump.refunds ??= [];
  dump.profiles ??= [];
  dump.settings ??= { stripeMode: "mock", cancelPolicy: "" };
  const seed = seedDump();
  for (const page of seed.cms) {
    if (!dump.cms.some((row) => row.id === page.id || (row.slug === page.slug && row.kind === page.kind))) {
      dump.cms.push(page);
    }
  }
  for (const row of seed.deadlines) {
    if (!dump.deadlines.some((item) => item.id === row.id)) dump.deadlines.push(row);
  }
  for (const row of seed.profiles) {
    if (!dump.profiles.some((item) => item.userId === row.userId)) dump.profiles.push(row);
  }
  for (const row of seed.abandoned) {
    if (!dump.abandoned.some((item) => item.id === row.id || item.email === row.email)) dump.abandoned.push(row);
  }
  dump.deadlines = dump.deadlines.map((row) => ({ ...row, remindersSent: row.remindersSent ?? [] }));
  dump.automations = dump.automations.map((rule) => ({
    ...rule,
    steps: rule.steps.map((step) => ({ ...step, delayHours: step.delayHours ?? 0 })),
  }));
  dump.aml = dump.aml.map((row) => {
    const approved = row.status === "approved";
    return {
      ...row,
      questionnaireAt: row.questionnaireAt ?? (Object.keys(row.questionnaire || {}).length ? row.reviewDueAt : null),
      idDocumentStatus: row.idDocumentStatus ?? (approved ? "accepted" : "missing"),
      poaStatus: row.poaStatus ?? (approved ? "accepted" : "missing"),
      selfieStatus: row.selfieStatus ?? (approved ? "accepted" : "missing"),
      faceMatchConfirmed: row.faceMatchConfirmed ?? approved,
      staffNotes: row.staffNotes ?? (approved ? "Staff confirmed face match — no biometric vendor." : ""),
    };
  });
  return dump;
}

class PracticeStore {
  private data: PracticeDump | null = null;
  private queue: Promise<void> = Promise.resolve();

  private async load(): Promise<PracticeDump> {
    if (this.data) return this.data;
    const remote = await loadPracticeDump();
    if (remote.ok && remote.dump) {
      const beforeCms = remote.dump.cms?.length ?? 0;
      const beforeProfiles = remote.dump.profiles?.length ?? 0;
      const beforeAbandoned = remote.dump.abandoned?.length ?? 0;
      this.data = migrate(remote.dump);
      if (
        this.data.cms.length > beforeCms ||
        this.data.profiles.length > beforeProfiles ||
        this.data.abandoned.length > beforeAbandoned
      ) {
        await this.persist();
      }
      return this.data;
    }
    if (remote.ok && !remote.dump) {
      this.data = seedDump();
      await this.persist();
      return this.data;
    }
    try {
      const raw = await readFile(STORE_PATH, "utf8");
      this.data = migrate(JSON.parse(raw) as PracticeDump);
    } catch {
      this.data = seedDump();
      await this.persist();
    }
    return this.data;
  }

  private async persist(): Promise<void> {
    if (!this.data) return;
    await savePracticeDump(this.data);
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(this.data, null, 2));
  }

  private mutate<T>(fn: (data: PracticeDump) => T): Promise<T> {
    const run = this.queue.then(async () => {
      const data = await this.load();
      const result = fn(data);
      await this.persist();
      return result;
    });
    this.queue = run.then(() => undefined, () => undefined);
    return run;
  }

  async snapshot(): Promise<PracticeDump> {
    return this.load();
  }

  async audit(userId: string, userEmail: string, action: string, details: string): Promise<AuditEvent> {
    return this.mutate((data) => {
      const event: AuditEvent = {
        id: `aud_${randomUUID()}`,
        firmId: FIRM_ID,
        userId,
        userEmail,
        action,
        details,
        createdAt: nowIso(),
      };
      data.audit.unshift(event);
      data.audit = data.audit.slice(0, 2000);
      return event;
    });
  }

  async saveCms(page: CmsPage): Promise<CmsPage> {
    return this.mutate((data) => {
      const i = data.cms.findIndex((row) => row.id === page.id || (row.slug === page.slug && row.kind === page.kind));
      if (i >= 0) data.cms[i] = page;
      else data.cms.push(page);
      return page;
    });
  }

  async saveLead(lead: Lead): Promise<Lead> {
    return this.mutate((data) => {
      const i = data.leads.findIndex((row) => row.id === lead.id);
      if (i >= 0) data.leads[i] = lead;
      else data.leads.unshift(lead);
      return lead;
    });
  }

  async saveInvoice(invoice: PracticeInvoice): Promise<PracticeInvoice> {
    return this.mutate((data) => {
      const i = data.invoices.findIndex((row) => row.id === invoice.id);
      if (i >= 0) data.invoices[i] = invoice;
      else data.invoices.unshift(invoice);
      return invoice;
    });
  }

  async saveJob(job: PracticeJob): Promise<PracticeJob> {
    return this.mutate((data) => {
      const i = data.jobs.findIndex((row) => row.id === job.id);
      if (i >= 0) data.jobs[i] = job;
      else data.jobs.unshift(job);
      return job;
    });
  }

  async savePromo(promo: PromoCode): Promise<PromoCode> {
    return this.mutate((data) => {
      const i = data.promos.findIndex((row) => row.id === promo.id);
      if (i >= 0) data.promos[i] = promo;
      else data.promos.unshift(promo);
      return promo;
    });
  }

  async saveAutomation(rule: AutomationRule): Promise<AutomationRule> {
    return this.mutate((data) => {
      const i = data.automations.findIndex((row) => row.id === rule.id);
      if (i >= 0) data.automations[i] = rule;
      else data.automations.unshift(rule);
      return rule;
    });
  }

  async saveAml(row: AmlCase): Promise<AmlCase> {
    return this.mutate((data) => {
      const i = data.aml.findIndex((item) => item.id === row.id);
      if (i >= 0) data.aml[i] = row;
      else data.aml.unshift(row);
      return row;
    });
  }

  async saveDeadline(row: HmrcDeadline): Promise<HmrcDeadline> {
    return this.mutate((data) => {
      const i = data.deadlines.findIndex((item) => item.id === row.id);
      if (i >= 0) data.deadlines[i] = row;
      else data.deadlines.unshift(row);
      return row;
    });
  }

  async saveSubscription(row: PracticeSubscription): Promise<PracticeSubscription> {
    return this.mutate((data) => {
      const i = data.subscriptions.findIndex((item) => item.id === row.id);
      if (i >= 0) data.subscriptions[i] = row;
      else data.subscriptions.unshift(row);
      return row;
    });
  }

  async saveAbandoned(row: AbandonedCheckout): Promise<AbandonedCheckout> {
    return this.mutate((data) => {
      const i = data.abandoned.findIndex(
        (item) => item.email === row.email && item.packageId === row.packageId && !item.emailedAt,
      );
      if (i >= 0) {
        data.abandoned[i] = { ...data.abandoned[i], ...row, id: data.abandoned[i].id };
        return data.abandoned[i];
      }
      data.abandoned.unshift(row);
      return row;
    });
  }

  async saveRefund(row: PracticeDump["refunds"][number]): Promise<PracticeDump["refunds"][number]> {
    return this.mutate((data) => {
      data.refunds.unshift(row);
      return row;
    });
  }

  async saveProfile(row: ClientProfile): Promise<ClientProfile> {
    return this.mutate((data) => {
      const i = data.profiles.findIndex((item) => item.userId === row.userId);
      if (i >= 0) data.profiles[i] = row;
      else data.profiles.push(row);
      return row;
    });
  }

  async nextInvoiceNumber(): Promise<string> {
    const data = await this.load();
    return `INV-${new Date().getFullYear()}-${String(data.invoices.length + 1).padStart(4, "0")}`;
  }

  async publishedHome(): Promise<CmsPage | null> {
    const data = await this.load();
    return data.cms.find((page) => page.slug === "home" && page.published) ?? null;
  }

  async publishedBySlug(slug: string): Promise<CmsPage | null> {
    const data = await this.load();
    return data.cms.find((page) => page.slug === slug && page.published) ?? null;
  }

  async publishedFaqs(): Promise<CmsPage[]> {
    const data = await this.load();
    return data.cms.filter((page) => page.kind === "faq" && page.published);
  }

  async publishedTestimonials(): Promise<CmsPage[]> {
    const data = await this.load();
    return data.cms.filter((page) => page.kind === "testimonial" && page.published);
  }

  async publishedPosts(): Promise<CmsPage[]> {
    const data = await this.load();
    return data.cms.filter((page) => page.kind === "post" && page.published);
  }

  async publishedBanner(): Promise<CmsPage | null> {
    const data = await this.load();
    return data.cms.find((page) => page.kind === "banner" && page.published) ?? null;
  }
}

export const practiceStore = new PracticeStore();
export { defaultStages };
