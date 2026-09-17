import type { QuestionnaireAnswers, TaxDocumentKind } from "./types";

export type QuestionSection = {
  id: string;
  title: string;
  blurb: string;
  include: (answers: QuestionnaireAnswers) => boolean;
};

export const QUESTION_SECTIONS: QuestionSection[] = [
  {
    id: "personal",
    title: "Personal details",
    blurb: "We need the same identity details HMRC holds for you, so the return matches your Self Assessment record.",
    include: () => true,
  },
  {
    id: "employment",
    title: "Employment income",
    blurb: "PAYE jobs, including more than one employer in the year. Have P60 or P45 figures to hand if you can.",
    include: () => true,
  },
  {
    id: "self_employment",
    title: "Self-employed income",
    blurb: "Sole-trader turnover and allowable expenses. Leave this blank if you only had PAYE income.",
    include: () => true,
  },
  {
    id: "cis",
    title: "CIS income",
    blurb: "Construction Industry Scheme deductions. Only complete this if you worked under CIS.",
    include: (answers) => answers.hasSelfEmployment === true || answers.hasCis === true,
  },
  {
    id: "rental",
    title: "Rental income",
    blurb: "UK property you let, including a room in your home if it is above the rent-a-room threshold.",
    include: () => true,
  },
  {
    id: "investments",
    title: "Dividends, crypto and shares",
    blurb: "Company dividends, crypto disposals and share sales. We treat crypto and shares as capital gains unless you tell us otherwise.",
    include: () => true,
  },
  {
    id: "cgt",
    title: "Other capital gains",
    blurb: "Property, personal possessions over the reporting limit, or other assets sold in the year.",
    include: (answers) => answers.hasInvestments === true || answers.hasCgt !== false,
  },
  {
    id: "foreign",
    title: "Foreign income",
    blurb: "Overseas employment, pensions, property or bank interest that still needs to be reported in the UK.",
    include: () => true,
  },
  {
    id: "reliefs",
    title: "Allowances and reliefs",
    blurb: "Pension contributions, Gift Aid and Marriage Allowance can change the bill before we file.",
    include: () => true,
  },
  {
    id: "estimate",
    title: "Your estimate",
    blurb: "A working estimate from the answers you have given. Your accountant will review this before anything is filed.",
    include: () => true,
  },
];

export function visibleSections(answers: QuestionnaireAnswers): QuestionSection[] {
  return QUESTION_SECTIONS.filter((section) => section.include(answers));
}

export function suggestedDocuments(answers: QuestionnaireAnswers): { kind: TaxDocumentKind; label: string }[] {
  const list: { kind: TaxDocumentKind; label: string }[] = [];
  if (answers.hasEmployment) list.push({ kind: "p60", label: "P60 or final payslip" });
  if (answers.hasEmployment) list.push({ kind: "p45", label: "P45 if you left a job in the year" });
  if (answers.hasSelfEmployment) {
    list.push({ kind: "invoice", label: "Invoices or a sales summary" });
    list.push({ kind: "bank_statement", label: "Business bank statements" });
  }
  if (answers.hasCis) list.push({ kind: "other", label: "CIS statements" });
  if (answers.hasRental) list.push({ kind: "rental_spreadsheet", label: "Rental income and expenses spreadsheet" });
  if (answers.hasInvestments || answers.hasCgt) list.push({ kind: "other", label: "Broker or crypto gain reports" });
  list.push({ kind: "sa302", label: "Last year’s SA302 if you have one" });
  return list;
}

export function personalReady(answers: QuestionnaireAnswers): boolean {
  return Boolean(
    answers.firstName.trim() &&
      answers.lastName.trim() &&
      answers.nino.trim() &&
      answers.dateOfBirth &&
      answers.addressLine1.trim() &&
      answers.city.trim() &&
      answers.postcode.trim() &&
      answers.ukResident !== null,
  );
}
