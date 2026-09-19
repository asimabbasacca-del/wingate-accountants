import type { Metadata } from "next";
import { ArrowRight, Clock, ShieldCheck, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { HeroWithPhoto, SitePhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
import { AddOnCard } from "@/components/packages/addon-card";
import { ComparisonTable } from "@/components/packages/comparison-table";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { PackageGroupSection } from "@/components/packages/package-group";
import { ONBOARDING_STEPS, PACKAGE_FAQS } from "@/lib/packages/data";
import { groupsWithPackages } from "@/lib/packages/catalog";
import { getPublishedCatalog } from "@/lib/packages/backend";
import { practiceStore } from "@/lib/practice/store";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Accountancy Packages – Wingate Accountants Ltd" },
  description:
    "Fixed‑fee, specialist accountancy packages for contractors, landlords, small businesses and limited companies, with transparent pricing and expert support.",
  alternates: { canonical: `${SITE.url}/accountancy-packages/` },
};

export default async function AccountancyPackagesPage() {
  const catalog = await getPublishedCatalog();
  const groups = groupsWithPackages(catalog);
  const packages = catalog.packages;
  const addons = catalog.addons;
  const cmsFaqs = await practiceStore.publishedFaqs().catch(() => []);
  const faqs = [
    ...cmsFaqs.map((item) => {
      const blob = `${item.title} ${item.html}`;
      if (/\+?\s*VAT|plus VAT|inc VAT/i.test(blob) && /fee|price|package/i.test(blob)) {
        return {
          question: "What does the published package fee include?",
          answer:
            "The price on each package card is the fee for the work listed. Add-ons such as formation or a registered office are priced separately.",
        };
      }
      return { question: item.title, answer: item.html };
    }),
    ...PACKAGE_FAQS.filter((item) => !cmsFaqs.some((cms) => cms.title === item.question)),
  ];

  return (
    <>
      <HeroWithPhoto
        kicker="Wingate Accountants Ltd"
        title="Specialist Accountancy Packages, Fixed Fees, Transparent Pricing"
        imageSrc="/images/practice-office.png"
        imageAlt="Wingate Accountants practice meeting room"
        actions={
          <>
            <ButtonLink href="#packages" className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              View Packages <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/mtd-packages/"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              MTD packages
            </ButtonLink>
          </>
        }
      >
        <p>
          A named accountant, a same-working-day reply if you contact us before 3pm, and filings kept in line with
          HMRC and Companies House — without a surprise bill at year end.
        </p>
        <ul className="mt-6 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          <li className="flex gap-2">
            <UserRound className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            Dedicated accountant on your file
          </li>
          <li className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            Fast response, with a £50 credit if we miss it
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            HMRC and Companies House compliance
          </li>
        </ul>
      </HeroWithPhoto>

      <nav aria-label="Package groups" className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {groups.map(({ group }) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {group.name}
            </a>
          ))}
        </div>
      </nav>

      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="text-sm font-medium text-primary">Forming a limited company</p>
            <h2 className="font-heading mt-2 text-2xl font-semibold">Company formation for £150</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Companies House registration, first documents and help with a business bank account. VAT registration if
              you need it. The fee is £150.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/company-formation/" className="h-11 px-5">
                Company formation page
              </ButtonLink>
              <ButtonLink href="/accountancy-packages/start/?package=small-company&addon=company-formation" variant="outline" className="h-11 px-5">
                Start formation · £150
              </ButtonLink>
            </div>
          </div>
          <SitePhoto
            src="/images/company-formation.png"
            alt="Reviewing company formation documents"
            className="aspect-[16/10] min-h-[10rem]"
          />
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-6xl scroll-mt-20 space-y-16 px-4 py-16 sm:px-6">
        <div>
          <h2 className="font-heading text-3xl font-semibold">Choose a package</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Fees are around 5% lower than comparable published specialist packages we reviewed, rounded to a sensible UK
            monthly figure. The price on each card is the fee we charge.
          </p>
        </div>
        {groups.map(({ group, packages: groupPackages }) => (
          <PackageGroupSection key={group.id} group={group} packages={groupPackages} />
        ))}
      </section>

      <section id="compare" className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Compare packages</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Scroll sideways on a phone. The package name stays pinned so you can line up accounts, tax, VAT, payroll and
            support at a glance.
          </p>
          <div className="mt-8">
            <ComparisonTable packages={packages} />
          </div>
        </div>
      </section>

      <section id="addons" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Add-ons and bolt-ons</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Use these when the core package is right but you need formation, a registered office, extra payroll or another
          personal return. Nothing is added to your invoice until you ask for it.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {addons.map((addon) => (
            <AddOnCard key={addon.id} addon={addon} />
          ))}
        </div>
      </section>

      <section id="why-wingate" className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Why Wingate, if you have been looking at specialist contractor firms</h2>
          <p className="mt-3 max-w-3xl text-primary-foreground/80">
            You still get specialist packages for contractors, landlords, locums, creators and small companies — with
            the same kind of inclusions (accounts, tax, software, a named accountant). We do not copy anyone else’s
            wording; we match the work and price it to compete.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Specialist focus",
                text: "Separate packages for how you actually trade, instead of one generic “small business” fee.",
              },
              {
                title: "Around 5% lower",
                text: "Published monthly fees are set around 5% below comparable specialist packages, then rounded to a clean UK price.",
              },
              {
                title: "Manchester and London",
                text: "Personal accountants, not a faceless portal. The firm is based in London and works with clients in Manchester and nationwide by video.",
              },
              {
                title: "Digital by default",
                text: "Xero or QuickBooks, deadline reminders, and a client portal for tax-return onboarding and messages.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-primary-foreground/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="onboarding" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">How onboarding works</h2>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Four steps from the card you click to working with your accountant. Sole traders, personal landlords and
          Self Assessment continue in the{" "}
          <a className="font-medium text-primary underline-offset-2 hover:underline" href="/tax-returns/">
            tax returns portal
          </a>{" "}
          for identity checks. Limited companies are confirmed by the practice team.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {ONBOARDING_STEPS.map((step, index) => (
            <li key={step.n} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">Step {step.n}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-primary" style={{ width: `${((index + 1) / ONBOARDING_STEPS.length) * 100}%` }} />
              </div>
              <h3 className="font-heading mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <ButtonLink href="#packages" className="mt-8 h-11 px-5">
          Start with a package
        </ButtonLink>
      </section>

      <section id="faq" className="border-t border-border bg-secondary/40 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            }}
          />
          <h2 className="font-heading text-3xl font-semibold">Questions we are asked first</h2>
          <div className="mt-8">
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Ready to switch to clearer, fairer accountancy?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/80">
            Pick a package, complete the short form, then meet the accountant who will look after HMRC and Companies House
            with you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#packages" className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
              Choose a package
            </ButtonLink>
            <ButtonLink
              href="/contact-us/"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              Book a free discovery call
            </ButtonLink>
          </div>
        </div>
      </section>
      <ServicePageEnd slug="accountancy-packages" skipFaq />
    </>
  );
}
