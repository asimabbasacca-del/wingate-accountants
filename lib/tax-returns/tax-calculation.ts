import type { QuestionnaireAnswers, TaxEstimate } from "./types";

const PERSONAL_ALLOWANCE = 12570;
const BASIC_BAND = 37700;
const HIGHER_THRESHOLD = PERSONAL_ALLOWANCE + BASIC_BAND;
const ADDITIONAL_THRESHOLD = 125140;
const DIVIDEND_ALLOWANCE = 500;
const CGT_EXEMPT = 3000;
const CLASS4_LOWER = 12570;
const CLASS4_UPPER = 50270;

function taxOnNonDividend(income: number, allowance: number): number {
  const taxable = Math.max(0, income - allowance);
  const basic = Math.min(taxable, BASIC_BAND);
  const higher = Math.min(Math.max(0, taxable - BASIC_BAND), ADDITIONAL_THRESHOLD - HIGHER_THRESHOLD);
  const additional = Math.max(0, taxable - (ADDITIONAL_THRESHOLD - allowance));
  return basic * 0.2 + higher * 0.4 + additional * 0.45;
}

function dividendTax(dividends: number, otherIncome: number, allowance: number): number {
  const remainingAllowance = Math.max(0, allowance - otherIncome);
  const afterPa = Math.max(0, dividends - remainingAllowance);
  const afterDivAllowance = Math.max(0, afterPa - DIVIDEND_ALLOWANCE);
  if (afterDivAllowance <= 0) return 0;
  const otherTaxable = Math.max(0, otherIncome - allowance);
  let remainingBasic = Math.max(0, BASIC_BAND - otherTaxable);
  let left = afterDivAllowance;
  const basicSlice = Math.min(left, remainingBasic);
  left -= basicSlice;
  const higherSlice = Math.min(left, ADDITIONAL_THRESHOLD - HIGHER_THRESHOLD);
  left -= higherSlice;
  return basicSlice * 0.0875 + higherSlice * 0.3375 + left * 0.3935;
}

function class4(profit: number): number {
  if (profit <= CLASS4_LOWER) return 0;
  const main = Math.min(profit, CLASS4_UPPER) - CLASS4_LOWER;
  const extra = Math.max(0, profit - CLASS4_UPPER);
  return main * 0.06 + extra * 0.02;
}

export function calculateEstimate(answers: QuestionnaireAnswers): TaxEstimate {
  const notes: string[] = [];
  const employment = answers.hasEmployment ? Math.max(0, answers.employmentPay) : 0;
  const seProfit = answers.hasSelfEmployment
    ? Math.max(0, answers.selfEmploymentTurnover - answers.selfEmploymentExpenses)
    : 0;
  const cisNet = answers.hasCis ? Math.max(0, answers.cisGross) : 0;
  const rentalProfit = answers.hasRental ? Math.max(0, answers.rentalIncome - answers.rentalExpenses) : 0;
  const dividends = answers.hasInvestments ? Math.max(0, answers.dividends) : 0;
  const foreign = answers.hasForeign ? Math.max(0, answers.foreignIncome) : 0;
  const crypto = answers.hasInvestments ? Math.max(0, answers.cryptoGains) : 0;
  const shares = answers.hasInvestments ? Math.max(0, answers.shareGains) : 0;
  const otherCgt = answers.hasCgt ? Math.max(0, answers.otherCgtGains) : 0;
  const cgtLosses = Math.max(0, answers.cgtLosses);

  const nonDividendIncome = employment + seProfit + cisNet + rentalProfit + foreign;
  const pension = Math.max(0, answers.pensionContributions);
  const giftAidGross = Math.max(0, answers.giftAid) * 1.25;
  let allowance = PERSONAL_ALLOWANCE + pension;
  if (nonDividendIncome + dividends > 100000) {
    const reduction = Math.min(PERSONAL_ALLOWANCE, Math.floor((nonDividendIncome + dividends - 100000) / 2));
    allowance = Math.max(0, allowance - reduction);
    notes.push("Personal allowance starts to taper once adjusted net income is over £100,000.");
  }
  if (answers.marriageAllowance) {
    notes.push("Marriage Allowance is claimed on the return where you are eligible.");
  }

  const incomeTaxNonDiv = taxOnNonDividend(nonDividendIncome, allowance);
  const incomeTaxDiv = dividendTax(dividends, nonDividendIncome, allowance);
  const ni = class4(seProfit);
  const chargeableGains = Math.max(0, crypto + shares + otherCgt - cgtLosses - CGT_EXEMPT);
  const higherRate = nonDividendIncome + dividends > HIGHER_THRESHOLD;
  const cgt = chargeableGains * (higherRate ? 0.24 : 0.18);
  const paid = (answers.hasEmployment ? answers.employmentTaxDeducted : 0) + (answers.hasCis ? answers.cisTaxDeducted : 0);
  const giftAidRelief = giftAidGross * (higherRate ? 0.2 : 0);

  const liability = Math.max(0, incomeTaxNonDiv + incomeTaxDiv + ni + cgt - giftAidRelief);
  const net = liability - paid;
  const estimatedLiability = Math.max(0, net);
  const estimatedRefund = Math.max(0, -net);

  if (answers.hasEmployment) notes.push("PAYE already deducted is set against the Self Assessment estimate.");
  if (answers.hasCis) notes.push("CIS tax deducted is treated as tax already paid.");
  notes.push("This is an estimate for the 2025–26 year, not a filed computation or tax advice.");

  return {
    totalIncome: nonDividendIncome + dividends,
    taxableIncome: Math.max(0, nonDividendIncome + dividends - allowance),
    incomeTax: incomeTaxNonDiv + incomeTaxDiv,
    class4Ni: ni,
    cgt,
    taxAlreadyPaid: paid,
    estimatedLiability,
    estimatedRefund,
    netPosition: net,
    notes,
  };
}
