import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileCheck, Lock, PoundSterling, Shield, Users } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { StartNowButton } from "@/components/tax-returns/start-now-button";
import { PLANS } from "@/lib/tax-returns/plans";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Online Tax Return Preparation Service – Wingate Accountants Ltd" },
  description:
    "Online Tax Return Preparation Service from Wingate Accountants. Fixed fees, qualified accountants, secure document upload, HMRC filing and progress tracking for Self Assessment and personal tax.",
  alternates: { canonical: `${SITE.url}/online-tax-return-preparation-service/` },
};

const POINTS = [
  { icon: PoundSterling, title: "Fixed Fees", text: "Published prices for Prepared & Filed, Optimised & Protected, and Year-Round Tax Partner. No surprise hourly bills for a standard Self Assessment." },
  { icon: Users, title: "Qualified Accountants", text: "A named Wingate accountant prepares the return. ACCA, CIMA or CTA training is on the file — this is not an unsupervised form dump." },
  { icon: Lock, title: "Secure Document Upload", text: "P60s, bank statements and identity papers stay in your document vault. Only you and your Wingate accountant can open them." },
  { icon: FileCheck, title: "HMRC Filing", text: "You approve the computation. We file the Self Assessment and store the receipt, SA100 working copy and SA302 in the portal." },
  { icon: Shield, title: "Progress Tracking", text: "See outstanding tasks, AML status, messages and invoices from My Tax Portal on a phone or a desktop." },
];

const JOURNEY = [
  "View tax return packages",
  "Create an account and verify your email",
  "Sign in to My Tax Portal",
  "Purchase a package",
  "Sign the engagement letter",
  "Complete AML / KYC checks",
  "Upload documents and the tax questionnaire",
  "Message your accountant and approve the return",
  "Download the tax return and HMRC documents",
];

export default function OnlineTaxReturnPreparationServicePage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-accent uppercase">Wingate Accountants Ltd · Self Assessment</p>
          <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">
            Online Tax Return Preparation Service
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
            The primary onboarding journey for Self Assessment and personal tax clients. Same Wingate branding, same
            accountants, a client account that takes you from package choice through to the HMRC receipt.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StartNowButton className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              Start Now <ArrowRight />
            </StartNowButton>
            <ButtonLink
              href="#packages"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              View Packages
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">What is included</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((point) => (
            <article key={point.title} className="rounded-2xl border border-border bg-card p-6">
              <point.icon className="size-6 text-primary" />
              <h3 className="font-heading mt-3 text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{point.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="packages" className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Tax return packages</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Individuals only. Limited companies and LLPs use a separate accounts engagement. Prices are for one person’s
            2025–26 Self Assessment with Wingate Accountants Limited.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, index) => (
              <article
                key={plan.id}
                className={`flex flex-col rounded-2xl border bg-card p-6 ${index === 1 ? "border-accent shadow-md" : "border-border"}`}
              >
                {index === 1 ? (
                  <p className="text-xs font-semibold tracking-wide text-accent uppercase">Most people choose this</p>
                ) : null}
                <h3 className="font-heading mt-2 text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-3xl font-semibold">{plan.priceLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <StartNowButton planId={plan.id} className="mt-6 h-11">
                  Start Now
                </StartNowButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">How the client journey works</h2>
        <ol className="mt-8 grid gap-3 md:grid-cols-2">
          {JOURNEY.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <span className="font-heading text-lg text-accent">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          MTD for Income Tax bridging is in development. We still prepare and file the Self Assessment; the portal will
          hold the live HMRC receipt when those credentials are connected.
        </p>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Start your 2025–26 return</h2>
              <p className="mt-1 text-sm text-primary-foreground/75">
                Create a client account, verify your email, then purchase a package in My Tax Portal.
              </p>
            </div>
            <StartNowButton className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
              Start Now
            </StartNowButton>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            <Link className="underline" href="/tax-returns/aml-policy/">
              AML policy
            </Link>
            {" · "}
            <Link className="underline" href="/tax-returns/engagement-terms/">
              Engagement terms
            </Link>
            {" · "}
            <Link className="underline" href="/privacy-policy/">
              Privacy policy
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
