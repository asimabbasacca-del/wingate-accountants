import type { FaqItem } from "@/lib/packages/types";

export type RelatedService = { href: string; title: string };

export type ServicePage = {
  slug: string;
  href: string;
  title: string;
  related: RelatedService[];
  faqs: FaqItem[];
  skipFaq?: boolean;
};

const SA: RelatedService = { href: "/self-assessment-tax-returns/", title: "Self Assessment" };
const DISCLOSE: RelatedService = { href: "/hmrc-tax-disclosure-london/", title: "Tax disclosures" };
const CGT: RelatedService = { href: "/capital-gains-tax/", title: "Capital Gains Tax" };
const INVEST: RelatedService = { href: "/tax-investigations/", title: "Tax investigations" };
const PACKAGES: RelatedService = { href: "/accountancy-packages/", title: "Accountancy packages" };
const MTD: RelatedService = { href: "/making-tax-digital-for-income-tax/", title: "Making Tax Digital" };
const MTD_PACK: RelatedService = { href: "/mtd-packages/", title: "MTD packages" };
const FORM: RelatedService = { href: "/company-formation/", title: "Company formation" };
const PAYROLL: RelatedService = { href: "/payroll-services/", title: "Payroll" };
const BOOKS: RelatedService = { href: "/bookkeeping-services/", title: "Bookkeeping" };
const ACCOUNTS: RelatedService = { href: "/annual-accounts-services/", title: "Annual accounts" };
const PERSONAL: RelatedService = { href: "/personal-tax-accountants/", title: "Personal tax" };
const ONLINE: RelatedService = { href: "/online-tax-return-preparation-service/", title: "Online tax return" };

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "Who at Wingate looks after the work?",
    answer:
      "A named accountant. You are not passed around a call centre. Write or call before 3pm for a same-working-day reply.",
  },
  {
    question: "Do you work outside London?",
    answer:
      "Yes. The office is at 128 City Road, London. We work with clients in Manchester and across the UK by video as standard.",
  },
  {
    question: "How do fees work?",
    answer:
      "Published packages show the fee on the card. One-off work is quoted before we start. Nothing is added to an invoice until you ask for it.",
  },
  {
    question: "How do I start?",
    answer:
      "Send the enquiry form on this page, call 01615 314179, or choose a package. Identity checks follow once we take you on.",
  },
];

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "self-assessment-tax-returns",
    href: "/self-assessment-tax-returns/",
    title: "Self Assessment",
    related: [ONLINE, DISCLOSE, CGT, INVEST, MTD],
    faqs: DEFAULT_FAQS,
    skipFaq: true,
  },
  {
    slug: "online-tax-return-preparation-service",
    href: "/online-tax-return-preparation-service/",
    title: "Online Tax Return Preparation Service",
    related: [SA, PERSONAL, MTD, PACKAGES],
    faqs: [
      {
        question: "Who is the online tax return service for?",
        answer:
          "Individuals who need a Self Assessment prepared and filed. Limited companies and LLPs use an accounts package instead.",
      },
      {
        question: "What are the published fees?",
        answer: "Prepared & Filed is £250. Optimised & Protected is £325. Year-Round Tax Partner is £25 a month.",
      },
      {
        question: "How do I send documents?",
        answer: "Through My Tax Portal after you create an account. P60s, bank statements and ID stay in your document vault.",
      },
      {
        question: "When do you file with HMRC?",
        answer: "After you approve the computation. We store the HMRC receipt and working copy in the portal.",
      },
      {
        question: "What if income was missed in earlier years?",
        answer: "Use the tax disclosure service rather than squeezing historic income into this year’s return.",
      },
    ],
  },
  {
    slug: "tax-investigations",
    href: "/tax-investigations/",
    title: "Tax Investigations and compliance",
    related: [DISCLOSE, CGT, SA, PACKAGES],
    faqs: [
      {
        question: "HMRC has written. What should I do first?",
        answer:
          "Do not ignore the letter and do not send a box of records unprompted. Call us. We take the correspondence and check what they are entitled to see.",
      },
      {
        question: "Do you handle COP9 and COP8?",
        answer: "Yes. Fraud Investigation Service and Code of Practice cases sit with a named accountant, not a one-off boutique.",
      },
      {
        question: "Will this stay confidential?",
        answer: "Yes. The first discussion is confidential. You decide any settlement. We do not write to HMRC until you instruct us.",
      },
      {
        question: "Can you take over an enquiry already in progress?",
        answer: "Yes. We write to HMRC as your agent and ask for the papers already on the file.",
      },
      {
        question: "Is this only for London clients?",
        answer: "No. Enquiries are handled nationwide. Meetings are by video unless you want to come to City Road.",
      },
    ],
  },
  {
    slug: "accountancy-packages",
    href: "/accountancy-packages/",
    title: "Accountancy Packages",
    related: [FORM, MTD_PACK, PAYROLL, SA],
    faqs: DEFAULT_FAQS,
    skipFaq: true,
  },
  {
    slug: "company-formation",
    href: "/company-formation/",
    title: "Company Formation",
    related: [PACKAGES, ACCOUNTS, PAYROLL, SA],
    faqs: DEFAULT_FAQS,
    skipFaq: true,
  },
  {
    slug: "making-tax-digital-for-income-tax",
    href: "/making-tax-digital-for-income-tax/",
    title: "Making Tax Digital",
    related: [MTD_PACK, SA, PACKAGES, BOOKS],
    faqs: DEFAULT_FAQS,
    skipFaq: true,
  },
  {
    slug: "mtd-packages",
    href: "/mtd-packages/",
    title: "MTD Packages",
    related: [MTD, SA, PACKAGES, FORM],
    faqs: DEFAULT_FAQS,
    skipFaq: true,
  },
  {
    slug: "personal-tax-accountants",
    href: "/personal-tax-accountants/",
    title: "Personal Tax",
    related: [SA, ONLINE, CGT, DISCLOSE],
    faqs: [
      {
        question: "What counts as personal tax work?",
        answer:
          "Self Assessment, employment income, savings, pensions, dividends, property and capital gains on a personal return — not company accounts.",
      },
      {
        question: "Do directors need a personal return as well as company accounts?",
        answer: "Often yes, if there are dividends, a second job, or property. Company packages can include one director Self Assessment.",
      },
      {
        question: "Can you file if I live outside London?",
        answer: "Yes. Personal tax is done through the portal and video. The firm is in London and works UK-wide.",
      },
      {
        question: "What if I have never filed before?",
        answer: "We register you with HMRC if needed, then prepare the return from the records you upload.",
      },
      {
        question: "How do I start?",
        answer: "Use the online tax return service for a published Self Assessment fee, or send the form on this page for mixed personal work.",
      },
    ],
  },
  {
    slug: "hmrc-tax-disclosure-london",
    href: "/hmrc-tax-disclosure-london/",
    title: "Tax Disclosures",
    related: [INVEST, CGT, SA, PACKAGES],
    faqs: [
      {
        question: "When do I need a disclosure rather than a normal return?",
        answer:
          "When income, rent or gains from earlier years were missed. Putting it only on this year’s Self Assessment is the wrong route and can make the enquiry worse.",
      },
      {
        question: "Will HMRC always penalise me?",
        answer:
          "Penalties depend on whether the error was careless or deliberate, and whether you came forward. We explain the range before anything is sent.",
      },
      {
        question: "Is the Let Property Campaign still used?",
        answer: "It remains a route for undeclared rental income. We tell you if a different disclosure facility fits better.",
      },
      {
        question: "Do you need to be in London?",
        answer: "No. The page is London-facing because that is where the office is. We take UK-wide disclosure files.",
      },
      {
        question: "What happens after HMRC agrees?",
        answer: "You pay what was agreed. Going forward, Self Assessment or a company package keeps the filings on time.",
      },
    ],
  },
  {
    slug: "capital-gains-tax",
    href: "/capital-gains-tax/",
    title: "Capital Gains Tax",
    related: [SA, DISCLOSE, INVEST, PERSONAL],
    faqs: [
      {
        question: "When is Capital Gains Tax due?",
        answer:
          "On disposals of chargeable assets — often property that is not your main home, shares and some crypto. Deadlines differ for UK property and other assets. We confirm the date that applies to your disposal.",
      },
      {
        question: "Do I report a gain on Self Assessment?",
        answer: "Many gains go on the Self Assessment. UK residential property often needs a separate return as well. We file the right one.",
      },
      {
        question: "What if a past sale was never reported?",
        answer: "That is a disclosure, not a late current-year return. Use the tax disclosure service.",
      },
      {
        question: "Can you value the asset?",
        answer: "We work from completion statements, broker reports and, where needed, a valuer. We do not guess a figure to shrink the gain.",
      },
      {
        question: "Is this only for London property?",
        answer: "No. We handle UK-wide disposals. The firm is based in London.",
      },
    ],
  },
  {
    slug: "payroll-services",
    href: "/payroll-services/",
    title: "Payroll",
    related: [PACKAGES, BOOKS, ACCOUNTS, FORM],
    faqs: [
      {
        question: "How many people are included on a package?",
        answer: "Standard monthly company packages include payroll for two. Extra people are a published add-on.",
      },
      {
        question: "Do you run PAYE for directors only?",
        answer: "Yes. Many owner-managed companies only need a director on payroll. We still file FPS on time.",
      },
      {
        question: "Can you take over from another bureau?",
        answer: "Yes. We collect the RTI history and open the new tax year or continue mid-year without a gap.",
      },
      {
        question: "Is Auto Enrolment included?",
        answer: "Pension assessment and submissions are scoped on the engagement. Tell us headcount on the first call.",
      },
    ],
  },
  {
    slug: "bookkeeping-services",
    href: "/bookkeeping-services/",
    title: "Bookkeeping",
    related: [PACKAGES, PAYROLL, ACCOUNTS, MTD],
    faqs: [
      {
        question: "Do I need bookkeeping if I already have Xero?",
        answer: "Software is not bookkeeping. We review or keep the books so VAT, payroll and accounts are drawn from clean figures.",
      },
      {
        question: "Is bookkeeping only for limited companies?",
        answer: "Limited companies and LLPs use bookkeeping packages. Sole traders who need quarterly MTD use an MTD package.",
      },
      {
        question: "How often do you post the books?",
        answer: "Monthly on standard packages, with a named accountant reviewing rather than a remote processing pool.",
      },
      {
        question: "Can you start mid-year?",
        answer: "Yes. We pick up from the last VAT return or management pack and catch the year up.",
      },
    ],
  },
  {
    slug: "vat-accountancy-services",
    href: "/vat-accountancy-services/",
    title: "VAT",
    related: [PACKAGES, BOOKS, MTD, ACCOUNTS],
    faqs: [
      {
        question: "Do you file VAT returns?",
        answer: "Yes, when the business is VAT-registered. Making Tax Digital for VAT needs compatible software — Xero or QuickBooks on the packages.",
      },
      {
        question: "Can you register us for VAT?",
        answer: "Yes, compulsory or voluntary. We will say if voluntary registration will make you more expensive to your customers.",
      },
      {
        question: "What if we crossed the threshold last year and did not register?",
        answer: "That is a late registration. We calculate the historic VAT and register from the right date rather than hoping it averages down.",
      },
      {
        question: "Is VAT the same as MTD for Income Tax?",
        answer: "No. VAT MTD is for VAT-registered businesses. MTD for Income Tax is quarterly updates on a personal return for sole traders and landlords.",
      },
    ],
  },
  {
    slug: "annual-accounts-services",
    href: "/annual-accounts-services/",
    title: "Annual Accounts",
    related: [PACKAGES, FORM, PAYROLL, SA],
    faqs: [
      {
        question: "Who needs annual accounts?",
        answer: "UK limited companies and LLPs. Sole traders do not file Companies House accounts; they use Self Assessment.",
      },
      {
        question: "What is included on a company package?",
        answer: "Year-end accounts, corporation tax (CT600), one director Self Assessment on standard packages, and software.",
      },
      {
        question: "How long does the first year take?",
        answer: "Once books and ID are in, a straightforward year is prepared to the Companies House and HMRC deadlines we agree at engagement.",
      },
      {
        question: "Can you take over from another accountant?",
        answer: "Yes. We write for professional clearance and the last accounts, then open the next year.",
      },
    ],
  },
  {
    slug: "business-tax-planning",
    href: "/business-tax-planning/",
    title: "Business Tax Planning",
    related: [PACKAGES, FORM, SA, CGT],
    faqs: [
      {
        question: "Is this separate from the monthly package?",
        answer: "Day-to-day tax on the return is in the package. A defined planning question — incorporation, a property sale, a group — is scoped, often as an advisory session.",
      },
      {
        question: "Will you guarantee a tax saving?",
        answer: "No. We structure what the law allows. If staying a sole trader is better, we say so.",
      },
      {
        question: "Do you advise on IR35?",
        answer: "Yes, for contractors on a company package. Status is a facts test, not a slogan on a website.",
      },
      {
        question: "How do I book it?",
        answer: "Send the form on this page or add a specialist advisory session on the packages checkout.",
      },
    ],
  },
  {
    slug: "construction-industry-scheme",
    href: "/construction-industry-scheme/",
    title: "CIS",
    related: [PACKAGES, PAYROLL, SA, MTD],
    faqs: [
      {
        question: "Do you file CIS as well as payroll?",
        answer: "Yes, where the company or sole trader is in the Construction Industry Scheme. Monthly returns sit with the named accountant.",
      },
      {
        question: "Can you apply for gross payment status?",
        answer: "We can apply when the compliance history supports it. It is not automatic and HMRC can refuse.",
      },
      {
        question: "Is CIS the same as being an employee?",
        answer: "No. CIS is a deduction scheme for subcontractors. Employment status is a separate test. We look at both.",
      },
      {
        question: "Sole trader or company for CIS work?",
        answer: "That depends on contracts, tools and who takes the risk. Formation is £150 if a company is the right next step.",
      },
    ],
  },
  {
    slug: "services",
    href: "/services/",
    title: "Services",
    related: [SA, PACKAGES, INVEST, FORM, MTD, DISCLOSE],
    faqs: DEFAULT_FAQS,
  },
];

const BY_SLUG = new Map(SERVICE_PAGES.map((item) => [item.slug, item]));

export function getServicePage(slug: string): ServicePage | undefined {
  return BY_SLUG.get(slug);
}

export function isServiceSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export const LOCATION_SEO =
  "Wingate Accountants provides tax and accounting services across Manchester, London, and the UK.";
