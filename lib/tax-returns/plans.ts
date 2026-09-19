import type { PlanId } from "./types";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  amountGbp: number;
  billing: "once" | "month";
  highlights: string[];
  bestFor: string;
};

export const PLANS: Plan[] = [
  {
    id: "prepared",
    name: "Prepared & Filed",
    tagline: "A named accountant prepares your Self Assessment and files it with HMRC after you approve it.",
    priceLabel: "£250",
    amountGbp: 250,
    billing: "once",
    bestFor: "PAYE employees, first-time filers and straightforward personal returns",
    highlights: [
      "Personal tax questionnaire with an estimated bill or refund",
      "Document checklist for P60, P45, savings and pensions",
      "Accountant review before anything goes to HMRC",
      "One Self Assessment for the 2025–26 tax year",
      "Portal messages with your accountant while we prepare the return",
    ],
  },
  {
    id: "optimised",
    name: "Optimised & Protected",
    tagline: "Reliefs check, a planning review and support if HMRC writes about the year we file.",
    priceLabel: "£325",
    amountGbp: 325,
    billing: "once",
    bestFor: "Self-employed, landlords, dividends, CIS and mixed income",
    highlights: [
      "Everything in Prepared & Filed",
      "Reliefs and allowances review before filing",
      "Written summary of how the figures were reached",
      "HMRC letter help on the return we prepare",
      "Enquiry support on the year we file",
    ],
  },
  {
    id: "partner",
    name: "Year-Round Tax Partner",
    tagline: "A named accountant through the year, not only at the January deadline.",
    priceLabel: "£25/mo",
    amountGbp: 25,
    billing: "month",
    bestFor: "Sole traders and anyone who wants an accountant on tap all year",
    highlights: [
      "Everything in Optimised & Protected",
      "Named accountant for the tax year",
      "In-year questions on income, reliefs and records",
      "Priority review before the 31 January deadline",
      "Reminders for payments on account and MTD record-keeping",
    ],
  },
];

export function getPlan(id: PlanId | null): Plan | null {
  if (!id) return null;
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export type PlanComparisonRow = {
  label: string;
  prepared: boolean | string;
  optimised: boolean | string;
  partner: boolean | string;
};

export const PLAN_COMPARISON: PlanComparisonRow[] = [
  { label: "Named accountant prepares and files your Self Assessment", prepared: true, optimised: true, partner: true },
  { label: "You approve the figures before anything goes to HMRC", prepared: true, optimised: true, partner: true },
  { label: "Secure document vault and portal messages", prepared: true, optimised: true, partner: true },
  { label: "Estimated bill or refund with the questionnaire", prepared: true, optimised: true, partner: true },
  { label: "Reliefs and allowances review before filing", prepared: false, optimised: true, partner: true },
  { label: "Written summary of how the figures were reached", prepared: false, optimised: true, partner: true },
  { label: "HMRC letter help on the year we file", prepared: false, optimised: true, partner: true },
  { label: "Enquiry support on the return we prepare", prepared: false, optimised: true, partner: true },
  { label: "Named accountant through the tax year", prepared: false, optimised: false, partner: true },
  { label: "In-year questions on income, reliefs and records", prepared: false, optimised: false, partner: true },
  { label: "Reminders for payments on account and MTD record-keeping", prepared: false, optimised: false, partner: true },
];

export const SA_FAQS = [
  {
    question: "Do you actually file the return with HMRC?",
    answer:
      "Yes. A named Wingate accountant prepares the Self Assessment, you approve it in the portal, then we file it. You receive the working copy, the computation and the HMRC receipt in My Tax Portal.",
  },
  {
    question: "Which package should I choose?",
    answer:
      "Prepared & Filed (£250) is for PAYE employees and straightforward personal returns. Optimised & Protected (£325) adds a reliefs review and help if HMRC writes about the year we file. Year-Round Tax Partner (£25 a month) is for people who want a named accountant all year, not only in January.",
  },
  {
    question: "What do the three packages cost?",
    answer:
      "Prepared & Filed is £250 for the 2025–26 year. Optimised & Protected is £325. Year-Round Tax Partner is £25 a month. Limited companies and LLPs use a separate accounts package rather than these personal-tax fees.",
  },
  {
    question: "How long does it take?",
    answer:
      "Once identity checks are done and we have your documents, a straightforward return is usually prepared within a few working days. First-time filers still need a Unique Taxpayer Reference from HMRC, which can take weeks by post, so register early.",
  },
  {
    question: "What if my tax affairs are more complicated?",
    answer:
      "Landlords, CIS, dividends and mixed income usually fit Optimised & Protected. Large capital gains, multi-year pension tapering or full bookkeeping sit outside these three fees. We tell you before we start, and you can move to an accountancy package if you need year-end accounts as well.",
  },
  {
    question: "Can I switch from another accountant?",
    answer:
      "Yes. After you start a package we request professional clearance and the usual records. You do not need to chase the handover unless the outgoing firm asks you to confirm authority.",
  },
  {
    question: "Do you help with MTD for Income Tax?",
    answer:
      "We still prepare and file the annual Self Assessment. If you are in scope of quarterly MTD, use the monthly MTD Comply or MTD Complete packages. MTD bridging from this website is in development.",
  },
  {
    question: "Who are these packages for?",
    answer:
      "Individuals only: employees with extra income, sole traders, landlords in their own name, directors with dividends, CIS subcontractors and first-time filers. Limited Company and LLP accounts are on the accountancy packages page.",
  },
];
