import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileCheck,
  Home,
  Landmark,
  MessageSquare,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { TaxReturnPlanCards } from "@/components/tax-returns/plan-cards";
import { TaxReturnPlanComparison } from "@/components/tax-returns/plan-comparison";
import { StartNowButton } from "@/components/tax-returns/start-now-button";
import { SA_FAQS } from "@/lib/tax-returns/plans";
import { safeJsonLd } from "@/lib/security/html";
import { HeroWithPhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Self Assessment Tax Return UK | Wingate Accountants" },
  description:
    "Have a named Wingate accountant prepare and file your Self Assessment. Packages from £250, £325, or £25 a month year round. Individuals only.",
  alternates: { canonical: `${SITE.url}/self-assessment-tax-returns/` },
};

const TRUST = [
  { icon: UserRound, title: "A named accountant", text: "ACCA, CIMA or CTA training on the file. This is not an unsupervised form dump." },
  { icon: FileCheck, title: "You approve, then we file", text: "Nothing goes to HMRC until you have signed off the computation in the portal." },
  { icon: ShieldCheck, title: "Secure records", text: "P60s, bank statements and identity papers stay in your document vault." },
  { icon: MessageSquare, title: "Portal, not inbox tennis", text: "Questions, drafts and the HMRC receipt live in My Tax Portal on a phone or desktop." },
];

const STEPS = [
  {
    title: "Choose a package",
    text: "Prepared & Filed at £250, Optimised & Protected at £325, or Year-Round Tax Partner at £25 a month.",
  },
  {
    title: "Create your client account",
    text: "Verify your email, complete identity checks and sign the engagement letter. Then upload P60s, accounts and the tax questionnaire.",
  },
  {
    title: "We prepare. You approve. We file.",
    text: "Your accountant drafts the return, you review the bill or refund, then we file and store the HMRC receipt.",
  },
];

const WHO = [
  { icon: Wallet, title: "PAYE with extra income", text: "Savings, dividends, a side hustle or a pension that PAYE did not finish taxing." },
  { icon: Users, title: "Sole traders and freelancers", text: "Turnover, allowable costs and the annual Self Assessment, without a January scramble." },
  { icon: Home, title: "Landlords in your own name", text: "UK property pages, finance-cost restriction and records HMRC actually asks for." },
  { icon: Building2, title: "Company directors", text: "Salary, dividends and benefits that still need a personal return alongside the company." },
  { icon: Wrench, title: "CIS subcontractors", text: "Deduction statements, expenses and a return that matches what contractors already reported." },
  { icon: Landmark, title: "First-time filers", text: "UTR registration guidance, a document checklist and a named accountant for the first 31 January." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SA_FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function SelfAssessmentTaxReturnsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <HeroWithPhoto
        kicker={`${SITE.legalName} · Self Assessment`}
        title="Have your Self Assessment prepared and filed — without the January panic"
        imageSrc="/images/accountant-client-meeting.png"
        imageAlt="Accountant meeting a client to prepare a Self Assessment"
        actions={
          <>
            <StartNowButton className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              Start a tax return package <ArrowRight />
            </StartNowButton>
            <ButtonLink
              href="#packages"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              Compare packages
            </ButtonLink>
          </>
        }
      >
        <p>
          A named Wingate accountant prepares your personal tax return, you approve it, then we file it with HMRC.
          Three published packages: £250, £325, or £25 a month year round.
        </p>
        <p className="mt-3 text-sm text-primary-foreground/70">
          Individuals only. Limited companies and LLPs use{" "}
          <Link href="/accountancy-packages/" className="underline underline-offset-2">
            accountancy packages
          </Link>
          . MTD bridging is in development.
        </p>
      </HeroWithPhoto>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">What you can expect</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <item.icon className="size-6 text-primary" aria-hidden />
              <h3 className="font-heading mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="packages" className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-medium tracking-wide text-accent uppercase">Tax return packages</p>
          <h2 className="font-heading mt-2 text-3xl font-semibold">Published fees for the 2025–26 Self Assessment</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Same packages as our{" "}
            <Link href="/online-tax-return-preparation-service/" className="font-medium text-primary underline-offset-2 hover:underline">
              online tax return preparation service
            </Link>
            . Choose a plan, create an account, then finish onboarding in My Tax Portal.
          </p>
          <TaxReturnPlanCards />
          <p className="mt-6 text-sm text-muted-foreground">
            Need year-end accounts, VAT, payroll or quarterly MTD? See{" "}
            <Link href="/accountancy-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
              specialist accountancy packages
            </Link>{" "}
            or{" "}
            <Link href="/mtd-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
              MTD packages
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Compare what is included</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every package includes a named accountant and HMRC filing after you approve. The difference is how much
          review and year-round support you want around that.
        </p>
        <div className="mt-8">
          <TaxReturnPlanComparison />
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="font-heading text-sm font-semibold tracking-wide text-accent uppercase">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-heading mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
            <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-muted-foreground">
              File by 31 January after the tax year. Late filing still attracts an automatic £100 penalty, even if no
              tax is due. Start the package now if you still need a UTR — HMRC can take weeks to post it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Who these packages help</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          If HMRC expects a personal tax return, we can usually take it. These fees are for one person’s 2025–26 Self
          Assessment.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHO.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <item.icon className="size-6 text-primary" aria-hidden />
              <h3 className="font-heading mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Do you need to file?</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            You may need a Self Assessment if you are self-employed above the trading allowance, a partner in a
            partnership, a director with untaxed dividends, a landlord, liable to the High Income Child Benefit Charge,
            or you have sold property, shares or crypto. HMRC also writes to people whose PAYE code did not collect
            everything. If you are unsure, start a package or{" "}
            <Link href="/contact-us/" className="font-medium text-primary underline-offset-2 hover:underline">
              send us a note
            </Link>{" "}
            before 3pm for a same-working-day reply.
          </p>
          <p className="mt-4 max-w-3xl text-sm text-muted-foreground">
            Late or incomplete returns attract penalties and interest. We prepare the return so the figures match the
            records you give us. If income was missed in earlier years, use our{" "}
            <Link href="/hmrc-tax-disclosure-london/" className="font-medium text-primary underline-offset-2 hover:underline">
              tax disclosure
            </Link>{" "}
            service rather than squeezing it into this year’s form.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Still got questions?</h2>
        <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
          Write to {SITE.email} or call {SITE.phone}. The same accountants who file the return answer the phone.
        </p>
        <FAQAccordion items={SA_FAQS} />
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Start your 2025–26 Self Assessment</h2>
              <p className="mt-1 text-sm text-primary-foreground/75">
                £250, £325, or £25 a month. Create an account, pick a package, then finish in My Tax Portal.
              </p>
            </div>
            <StartNowButton className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
              Choose a package
            </StartNowButton>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link className="underline" href="/online-tax-return-preparation-service/">
              Online tax return preparation
            </Link>
            {" · "}
            <Link className="underline" href="/accountancy-packages/">
              Accountancy packages
            </Link>
            {" · "}
            <Link className="underline" href="/tax-returns/aml-policy/">
              AML policy
            </Link>
            {" · "}
            <Link className="underline" href="/tax-returns/engagement-terms/">
              Engagement terms
            </Link>
          </p>
        </div>
      </section>
      <ServicePageEnd slug="self-assessment-tax-returns" skipFaq />
    </>
  );
}
