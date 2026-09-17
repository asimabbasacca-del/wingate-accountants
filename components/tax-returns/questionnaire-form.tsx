"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { visibleSections } from "@/lib/tax-returns/questionnaire";
import { EMPTY_ANSWERS, type QuestionnaireAnswers, type TaxEstimate } from "@/lib/tax-returns/types";
import { money } from "./helpers";

export function QuestionnaireForm({
  initial,
  estimate,
  busy,
  onSave,
}: {
  initial: QuestionnaireAnswers;
  estimate: TaxEstimate | null;
  busy: boolean;
  onSave: (answers: QuestionnaireAnswers, currentSection: string, complete: boolean) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({ ...EMPTY_ANSWERS, ...initial });
  const sections = useMemo(() => visibleSections(answers), [answers]);
  const [index, setIndex] = useState(() => {
    const i = sections.findIndex((section) => section.id === "personal");
    return i < 0 ? 0 : i;
  });
  const section = sections[Math.min(index, sections.length - 1)];

  function set<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function yesNo(key: keyof QuestionnaireAnswers, label: string) {
    const value = answers[key];
    return (
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{label}</legend>
        <div className="flex gap-2">
          <Button type="button" variant={value === true ? "default" : "outline"} className="h-10 flex-1" onClick={() => set(key, true as never)}>
            Yes
          </Button>
          <Button type="button" variant={value === false ? "default" : "outline"} className="h-10 flex-1" onClick={() => set(key, false as never)}>
            No
          </Button>
        </div>
      </fieldset>
    );
  }

  function moneyField(key: keyof QuestionnaireAnswers, label: string) {
    return (
      <label className="block text-sm">
        {label}
        <Input
          className="mt-1 h-10"
          type="number"
          min={0}
          step="0.01"
          value={Number(answers[key] || 0)}
          onChange={(e) => set(key, Number(e.target.value) as never)}
        />
      </label>
    );
  }

  async function next() {
    const last = index >= sections.length - 1;
    try {
      await onSave(answers, section.id, last && section.id === "estimate");
      if (!last) setIndex((value) => value + 1);
    } catch {
      /* parent surfaces the error */
    }
  }

  async function back() {
    await onSave(answers, section.id, false);
    setIndex((value) => Math.max(0, value - 1));
  }

  return (
    <div className="space-y-6">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Question {index + 1} of {sections.length}
      </p>
      <div>
        <h2 className="font-heading text-2xl font-semibold">{section.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{section.blurb}</p>
      </div>
      <div className="grid gap-4">
        {section.id === "personal" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">First name<Input className="mt-1 h-10" value={answers.firstName} onChange={(e) => set("firstName", e.target.value)} /></label>
              <label className="text-sm">Last name<Input className="mt-1 h-10" value={answers.lastName} onChange={(e) => set("lastName", e.target.value)} /></label>
            </div>
            <label className="text-sm">National Insurance number<Input className="mt-1 h-10" value={answers.nino} onChange={(e) => set("nino", e.target.value.toUpperCase())} placeholder="AB123456C" /></label>
            <label className="text-sm">Date of birth<Input className="mt-1 h-10" type="date" value={answers.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></label>
            <label className="text-sm">Address<Input className="mt-1 h-10" value={answers.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Town or city<Input className="mt-1 h-10" value={answers.city} onChange={(e) => set("city", e.target.value)} /></label>
              <label className="text-sm">Postcode<Input className="mt-1 h-10" value={answers.postcode} onChange={(e) => set("postcode", e.target.value)} /></label>
            </div>
            {yesNo("ukResident", "Were you UK resident for the whole tax year?")}
            <label className="text-sm">
              Marital status
              <select className="mt-1 h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={answers.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)}>
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married or civil partner</option>
                <option value="divorced">Divorced or dissolved</option>
              </select>
            </label>
          </>
        ) : null}
        {section.id === "employment" ? (
          <>
            {yesNo("hasEmployment", "Did you have PAYE employment in 2025–26?")}
            {answers.hasEmployment ? (
              <>
                <label className="text-sm">Employer name<Input className="mt-1 h-10" value={answers.employerName} onChange={(e) => set("employerName", e.target.value)} /></label>
                {moneyField("employmentPay", "Total pay (from P60 / P45)")}
                {moneyField("employmentTaxDeducted", "Income tax already deducted")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "self_employment" ? (
          <>
            {yesNo("hasSelfEmployment", "Did you work for yourself as a sole trader?")}
            {answers.hasSelfEmployment ? (
              <>
                <label className="text-sm">Trading name<Input className="mt-1 h-10" value={answers.tradingName} onChange={(e) => set("tradingName", e.target.value)} /></label>
                {moneyField("selfEmploymentTurnover", "Turnover")}
                {moneyField("selfEmploymentExpenses", "Allowable expenses")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "cis" ? (
          <>
            {yesNo("hasCis", "Were you paid under the Construction Industry Scheme?")}
            {answers.hasCis ? (
              <>
                {moneyField("cisGross", "CIS gross payments")}
                {moneyField("cisTaxDeducted", "CIS tax deducted")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "rental" ? (
          <>
            {yesNo("hasRental", "Did you receive UK rental income?")}
            {answers.hasRental ? (
              <>
                {moneyField("rentalIncome", "Rents received")}
                {moneyField("rentalExpenses", "Allowable property expenses")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "investments" ? (
          <>
            {yesNo("hasInvestments", "Did you receive dividends, sell shares, or dispose of crypto?")}
            {answers.hasInvestments ? (
              <>
                {moneyField("dividends", "UK dividends")}
                {moneyField("cryptoGains", "Crypto gains (before the annual exempt amount)")}
                {moneyField("shareGains", "Share gains")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "cgt" ? (
          <>
            {yesNo("hasCgt", "Did you sell other chargeable assets (for example a residential property that is not your main home)?")}
            {answers.hasCgt ? (
              <>
                {moneyField("otherCgtGains", "Other gains")}
                {moneyField("cgtLosses", "Allowable losses")}
              </>
            ) : null}
          </>
        ) : null}
        {section.id === "foreign" ? (
          <>
            {yesNo("hasForeign", "Did you have foreign income to report in the UK?")}
            {answers.hasForeign ? moneyField("foreignIncome", "Foreign income (sterling)") : null}
          </>
        ) : null}
        {section.id === "reliefs" ? (
          <>
            {moneyField("pensionContributions", "Personal pension contributions")}
            {moneyField("giftAid", "Gift Aid donations (amount you paid)")}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={answers.marriageAllowance} onChange={(e) => set("marriageAllowance", e.target.checked)} />
              Claim Marriage Allowance if eligible
            </label>
          </>
        ) : null}
        {section.id === "estimate" && estimate ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Estimated position for 2025–26</p>
            <p className="font-heading mt-2 text-3xl font-semibold">
              {estimate.netPosition >= 0 ? `${money(estimate.estimatedLiability)} to pay` : `${money(estimate.estimatedRefund)} refund`}
            </p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>Total income <strong className="float-right">{money(estimate.totalIncome)}</strong></div>
              <div>Income tax <strong className="float-right">{money(estimate.incomeTax)}</strong></div>
              <div>Class 4 NIC <strong className="float-right">{money(estimate.class4Ni)}</strong></div>
              <div>Capital gains <strong className="float-right">{money(estimate.cgt)}</strong></div>
              <div>Already paid <strong className="float-right">{money(estimate.taxAlreadyPaid)}</strong></div>
            </dl>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              {estimate.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" className="h-11" disabled={index === 0 || busy} onClick={() => void back()}>
          Back
        </Button>
        <Button type="button" className="h-11 flex-1" disabled={busy} onClick={() => void next()}>
          {section.id === "estimate" ? "Save and continue to documents" : busy ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
