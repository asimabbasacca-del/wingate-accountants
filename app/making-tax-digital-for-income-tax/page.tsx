import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Home, Laptop, ShieldCheck, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { PackageCard } from "@/components/packages/package-card";
import { HeroWithPhoto, SitePhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
import { MTD_FAQS, MTD_PACKAGE_IDS, MTD_TIMELINE } from "@/lib/mtd/content";
import { getPublishedCatalog } from "@/lib/packages/backend";
import { formatMoney } from "@/lib/packages/catalog";
import { safeJsonLd } from "@/lib/security/html";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Making Tax Digital (MTD) for Income Tax | Wingate Accountants" },
  description:
    "MTD for Income Tax for sole traders and landlords. Digital records, quarterly updates and a named Wingate accountant. Basic monthly package from £45.",
  alternates: { canonical: `${SITE.url}/making-tax-digital-for-income-tax/` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MTD_FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default async function MakingTaxDigitalPage() {
  const catalog = await getPublishedCatalog();
  const packages = MTD_PACKAGE_IDS.map((id) => catalog.packages.find((item) => item.id === id)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const basic = packages[0];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <HeroWithPhoto
        kicker={`${SITE.legalName} · MTD`}
        title="MTD for Income Tax, with a named accountant — not just software"
        imageSrc="/images/digital-tax-desk.png"
        imageAlt="Digital tax records and receipts on an accountant’s desk"
        actions={
          <>
            <ButtonLink href="/mtd-packages/" className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              View MTD packages <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="#does-it-apply"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              Does MTD apply to me?
            </ButtonLink>
          </>
        }
      >
        <p>
          From April 2026, many sole traders and landlords must keep digital records and send quarterly updates to
          HMRC. Wingate includes MTD-ready software and a named accountant. The basic package is a monthly
          subscription
          {basic?.monthlyPrice != null ? ` from ${formatMoney(basic.monthlyPrice)}` : ""}.
        </p>
        <p className="mt-3 text-sm text-primary-foreground/70">
          Individuals only. Limited companies and LLPs use a separate accounts package. MTD bridging from this portal
          is in development.
        </p>
      </HeroWithPhoto>

      <section id="does-it-apply" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Does MTD for Income Tax apply to you?</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          You are in scope if you have self-employment or UK property income in your own name, and your qualifying
          income is over HMRC’s threshold for that year. PAYE employment on its own is not enough. Directors of limited
          companies do not use these Income Tax MTD rules for the company itself.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          <li className="rounded-2xl border border-border bg-card p-6">
            <UserRound className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading mt-3 text-lg font-semibold">Sole traders</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Freelancers, CIS subcontractors, locums and other self-employed people reporting on a personal tax
              return.
            </p>
          </li>
          <li className="rounded-2xl border border-border bg-card p-6">
            <Home className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading mt-3 text-lg font-semibold">Landlords</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Residential lets, including jointly owned property held personally. Company property uses a company
              package.
            </p>
          </li>
          <li className="rounded-2xl border border-border bg-card p-6">
            <Building2 className="size-6 text-primary" aria-hidden />
            <h3 className="font-heading mt-3 text-lg font-semibold">Not these packages</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Limited companies and LLPs stay on corporation tax and VAT MTD where registered. See{" "}
              <Link href="/accountancy-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
                accountancy packages
              </Link>
              .
            </p>
          </li>
        </ul>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">What MTD actually means</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            HMRC wants income reported through the year, not only in January. In practice that is digital records,
            compatible software, four quarterly updates, and a final declaration.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <ol className="space-y-4">
              {["Keep income and expenses in digital records", "Use HMRC-recognised software", "Send a quarterly update of totals", "File the year-end final declaration"].map(
                (item, index) => (
                  <li key={item} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="font-heading text-lg text-accent">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ol>
            <SitePhoto
              src="/images/accountant-client-meeting.png"
              alt="Wingate accountant meeting a client about tax records"
              className="aspect-[16/10] min-h-[14rem]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-6 text-primary" aria-hidden />
          <h2 className="font-heading text-3xl font-semibold">Your MTD timetable</h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {MTD_TIMELINE.map((item) => (
            <li key={item.date} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold tracking-wide text-accent uppercase">{item.date}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">How Wingate runs MTD</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Laptop,
                title: "Get the software right",
                text: "We put you on Xero or QuickBooks, connect the bank where we can, and show you how to capture receipts. You do not have to pick a second MTD app.",
              },
              {
                icon: UserRound,
                title: "Keep records through the year",
                text: "On MTD Comply you keep the books and we check the quarterly totals. On MTD Complete your accountant reviews the file before each deadline.",
              },
              {
                icon: ShieldCheck,
                title: "We submit, you approve",
                text: "Nothing goes to HMRC until you have seen the figures. MTD bridging from this website is in development; your accountant still files the live updates.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
                <item.icon className="size-6 text-primary" aria-hidden />
                <h3 className="font-heading mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-accent uppercase">Monthly subscription</p>
        <h2 className="font-heading mt-2 text-3xl font-semibold">Start with the basic MTD package, or take full cover</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Both are monthly. MTD Comply is the basic subscription if you are happy to keep your own records. MTD Complete
          is accountant-led. Full comparison and checkout live on the{" "}
          <Link href="/mtd-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
            MTD packages
          </Link>{" "}
          page.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">Still got questions?</h2>
          <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
            Write to {SITE.email} or call {SITE.phone} before 3pm for a same-working-day reply.
          </p>
          <FAQAccordion items={MTD_FAQS} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Get on the MTD calendar before April 2026</h2>
            <p className="mt-1 text-sm text-primary-foreground/75">
              Start the basic monthly package, or compare both on the MTD packages page.
            </p>
          </div>
          <ButtonLink href="/mtd-packages/" className="h-12 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
            Choose an MTD package
          </ButtonLink>
        </div>
      </section>
      <ServicePageEnd slug="making-tax-digital-for-income-tax" skipFaq />
    </>
  );
}
