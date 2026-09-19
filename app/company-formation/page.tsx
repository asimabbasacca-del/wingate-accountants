import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Check, Clock, Landmark, Laptop, Scale, Shield, UserRound, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { HeroWithPhoto, SitePhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
import { safeJsonLd } from "@/lib/security/html";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Company Formation UK | Wingate Accountants" },
  description:
    "Form a UK limited company with Wingate Accountants for £150. Companies House registration, incorporation documents, VAT help and a named accountant afterwards.",
  alternates: { canonical: `${SITE.url}/company-formation/` },
};

const INCLUDED = [
  "Registration with Companies House",
  "Certificate of incorporation",
  "Memorandum and articles of association",
  "Share certificates",
  "Help opening a business bank account",
  "VAT registration where you need it",
];

const STEPS = [
  {
    n: "1",
    title: "Tell us the company",
    text: "Proposed name, directors, shareholders and a registered office. We check the name is available before we file.",
  },
  {
    n: "2",
    title: "We file at Companies House",
    text: "Often the same working day. You receive the certificate of incorporation and the first company documents.",
  },
  {
    n: "3",
    title: "Open the bank and start trading",
    text: "We help with the bank account and VAT if you need it. Ongoing accounts sit on a limited-company package if you want us afterwards.",
  },
];

const AFTERCARE = [
  {
    icon: Laptop,
    title: "MTD-ready software",
    text: "Xero or QuickBooks is included on limited-company packages, so the books are digital from day one.",
  },
  {
    icon: Wallet,
    title: "Fixed monthly fees",
    text: "Accounts, corporation tax, payroll and one director Self Assessment sit on a published package. No surprise hourly bill for the listed work.",
  },
  {
    icon: UserRound,
    title: "A named accountant",
    text: "The same person looks after the company and your personal return. They structure salary and dividends once the company is live.",
  },
  {
    icon: Clock,
    title: "Same-working-day replies",
    text: "Write or call before 3pm and a Wingate accountant answers the same working day. Unlimited support on the package, not a ticket queue.",
  },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: "How you pay yourself",
    text: "A limited company can pay a mix of salary and dividends. Dividends come from profit after corporation tax and are taxed differently from employment income. We set that mix with you — not as a generic calculator.",
  },
  {
    icon: Landmark,
    title: "Company expenses",
    text: "Allowable costs sit in the company and reduce corporation tax. The rules are tighter than a sole trader’s. We keep claims on the right side of HMRC so take-home is not undone by a later enquiry.",
  },
  {
    icon: Shield,
    title: "Limited liability",
    text: "The company is a separate legal person. Your home, car and savings are not automatically on the line for company debts the way they are if you trade in your own name.",
  },
  {
    icon: Scale,
    title: "How clients see you",
    text: "Many agencies and larger clients will only contract with a limited company. Public accounts and a Companies House record are part of that standing. Over time you can build a company name that is not just your personal UTR.",
  },
];

const FAQS = [
  {
    question: "What does the £150 company formation include?",
    answer:
      "Companies House registration, the certificate of incorporation, memorandum and articles, share certificates, help with a business bank account, and VAT registration if you need it. The whole incorporation is £150.",
  },
  {
    question: "How quickly can you form the company?",
    answer:
      "Often the same working day once we have the proposed name, shareholders, directors and a registered office. Companies House can take longer if the name needs a check or you want a same-day premium filing.",
  },
  {
    question: "Do I have to use Wingate for accounts afterwards?",
    answer:
      "No. Formation stands on its own. If you then take a limited-company package, Xero or QuickBooks is included and a named accountant looks after accounts, corporation tax and one director Self Assessment.",
  },
  {
    question: "Should I stay a sole trader?",
    answer:
      "If turnover is still small and you want simpler filings, a sole trader or MTD package can be enough. Incorporation is worth it when you want limited liability, a more tax-efficient pay mix, or clients who will only engage a company. We say so on the first call if formation is the wrong next step.",
  },
  {
    question: "Can you use my own registered office?",
    answer:
      "Yes. Use your trading address, or add our registered office as a monthly add-on if you do not want Companies House mail arriving at home.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function CompanyFormationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <HeroWithPhoto
        kicker={`${SITE.legalName} · Company formation`}
        title="Forming your limited company — we handle Companies House from start to finish"
        imageSrc="/images/company-formation.png"
        imageAlt="Reviewing company formation documents with an accountant"
        actions={
          <>
            <ButtonLink
              href="/accountancy-packages/start/?package=small-company&addon=company-formation"
              className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90"
            >
              Start company formation · £150 <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/accountancy-packages/#limited-companies"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              Limited company packages
            </ButtonLink>
          </>
        }
      >
        <p>
          If forming a company is new to you, the paperwork is the dull part. Wingate registers the company, issues the
          first documents, and can have you trading the same working day. Company formation is £150.
        </p>
      </HeroWithPhoto>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">Let’s get started</p>
        <h2 className="font-heading mt-2 text-3xl font-semibold">What you get for £150</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Incorporation can feel daunting the first time. We take the whole process from the proposed name through to
          the certificate landing in your inbox. One fee for a complete formation. No separate Companies House surprise
          on a standard filing.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 rounded-xl border border-border bg-card p-4">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          The whole incorporation is <strong>£150</strong>. We can often form the company the same working day.
        </p>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">How formation works</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Three steps. You do not need to learn Companies House software.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">Step {step.n}</p>
                <h3 className="font-heading mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Make the most of trading through a company</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Formation is the first hour. The value is in how you pay yourself, what you claim, and who files the accounts.
          A{" "}
          <Link href="/accountancy-packages/#limited-companies" className="font-medium text-primary underline-offset-2 hover:underline">
            limited company package
          </Link>{" "}
          gives you a named accountant for the company and your personal return, with Xero or QuickBooks included.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {AFTERCARE.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <item.icon className="size-5 text-primary" aria-hidden />
              <h3 className="font-heading mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold">Why people incorporate</h2>
            <p className="mt-3 text-muted-foreground">
              A limited company is a separate legal person. That changes how you pay yourself, what you can claim, and
              who will contract with you. It is not automatically cheaper than being a sole trader — we will say if it
              is not.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border bg-card p-5">
                  <item.icon className="size-5 text-primary" aria-hidden />
                  <h3 className="font-heading mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
          <SitePhoto
            src="/images/practice-office.png"
            alt="Wingate Accountants meeting room"
            className="aspect-[4/3] min-h-[16rem]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Limited company or sole trader?</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          If you have just started, or you have been self-employed for a while and are weighing incorporation, this is
          the usual fork. Hundreds of thousands of private companies are formed in the UK each year. That does not mean
          a company is right for every trade.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6">
            <Building2 className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading mt-3 text-xl font-semibold">Stay a sole trader if</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              You want simpler filings: you work, we prepare the Self Assessment, you pay Income Tax and National
              Insurance on the profit. That is enough while you test the work, or while MTD for Income Tax on a personal
              return covers the quarterly calendar. Use a{" "}
              <Link href="/mtd-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
                monthly MTD package
              </Link>{" "}
              or{" "}
              <Link href="/self-assessment-tax-returns/" className="font-medium text-primary underline-offset-2 hover:underline">
                Self Assessment
              </Link>
              .
            </p>
          </article>
          <article className="rounded-2xl border border-accent bg-card p-6 shadow-md">
            <Landmark className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading mt-3 text-xl font-semibold">Incorporate if</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Clients expect a limited company, you want limited liability, or a salary-and-dividend mix will take home
              more after corporation tax. Formation is £150. Ongoing accounts, corporation tax and your director return
              sit on a company package once you are trading.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Questions before you incorporate</h2>
          <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
            Write to {SITE.email} or call {SITE.phone} before 3pm for a same-working-day reply.
          </p>
          <FAQAccordion items={FAQS} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Ready to form the company?</h2>
            <p className="mt-1 text-sm text-primary-foreground/75">
              £150. Same-working-day filing when Companies House allows it.
            </p>
          </div>
          <ButtonLink
            href="/accountancy-packages/start/?package=small-company&addon=company-formation"
            className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90"
          >
            Start company formation
          </ButtonLink>
        </div>
      </section>
      <ServicePageEnd slug="company-formation" skipFaq />
    </>
  );
}
