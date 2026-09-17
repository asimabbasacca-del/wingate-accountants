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
    tagline: "A complete Self Assessment, prepared by an accountant and filed with HMRC.",
    priceLabel: "£279",
    amountGbp: 279,
    billing: "once",
    bestFor: "PAYE employees, straightforward Self Assessment, first-time filers",
    highlights: [
      "Personal tax questionnaire with estimated bill or refund",
      "Document checklist for P60, P45 and savings",
      "Accountant review before anything goes to HMRC",
      "One Self Assessment for the 2025–26 tax year",
    ],
  },
  {
    id: "optimised",
    name: "Optimised & Protected",
    tagline: "Planning review, reliefs check and enquiry cover on the year we file.",
    priceLabel: "£479",
    amountGbp: 479,
    billing: "once",
    bestFor: "Self-employed, landlords, dividends, CIS and mixed income",
    highlights: [
      "Everything in Prepared & Filed",
      "Reliefs and allowances review before filing",
      "Written summary of how the figures were reached",
      "HMRC enquiry support on the return we prepare",
    ],
  },
  {
    id: "partner",
    name: "Year-Round Tax Partner",
    tagline: "A named accountant through the year, not only at the January deadline.",
    priceLabel: "£99/mo",
    amountGbp: 99,
    billing: "month",
    bestFor: "Growing sole traders, property portfolios and year-round questions",
    highlights: [
      "Everything in Optimised & Protected",
      "Named accountant for the tax year",
      "In-year questions on income, reliefs and MTD records",
      "Priority review before the 31 January deadline",
    ],
  },
];

export function getPlan(id: PlanId | null): Plan | null {
  if (!id) return null;
  return PLANS.find((plan) => plan.id === id) ?? null;
}
