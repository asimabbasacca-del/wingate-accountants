import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { FAQAccordion } from "@/components/packages/faq-accordion";
import { PackageCard } from "@/components/packages/package-card";
import { MtdPackageComparison } from "@/components/mtd/comparison";
import { HeroWithPhoto, SitePhoto } from "@/components/site-photo";
import { ServicePageEnd } from "@/components/service-page-end";
import { MTD_FAQS, MTD_PACKAGE_IDS } from "@/lib/mtd/content";
import { getPublishedCatalog } from "@/lib/packages/backend";
import { formatMoney } from "@/lib/packages/catalog";
import { SITE } from "@/lib/site";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "MTD Packages | Wingate Accountants" },
  description:
    "Monthly MTD packages for sole traders and landlords. MTD Comply is the basic subscription from £45. MTD Complete is accountant-led from £65.",
  alternates: { canonical: `${SITE.url}/mtd-packages/` },
};

const READY = [
  "Correct MTD setup from day one with HMRC-recognised software",
  "Quarterly updates and the year-end declaration",
  "Fewer last-minute errors and penalty letters",
  "Digital records your accountant can actually open",
  "Clear dates in the diary, not a January scramble",
];

export default async function MtdPackagesPage() {
  const catalog = await getPublishedCatalog();
  const [comply, complete] = MTD_PACKAGE_IDS.map((id) => catalog.packages.find((item) => item.id === id));
  if (!comply || !complete) notFound();

  return (
    <>
      <HeroWithPhoto
        kicker={`${SITE.legalName} · Monthly MTD packages`}
        title="MTD packages built around how you actually keep records"
        imageSrc="/images/practice-office.png"
        imageAlt="Meeting room in a UK accountancy practice"
        actions={
          <>
            <ButtonLink href="#packages" className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              Compare MTD packages <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/making-tax-digital-for-income-tax/"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              What is MTD?
            </ButtonLink>
          </>
        }
      >
        <p>
          Two monthly subscriptions for sole traders and landlords. MTD Comply is the basic package if you keep the
          books yourself. MTD Complete is full accountant cover, including VAT, payroll and CIS where they apply.
        </p>
        <p className="mt-3 text-sm text-primary-foreground/70">
          Software is included. MTD bridging from this website is in development — your accountant still files the
          updates that are live today.
        </p>
      </HeroWithPhoto>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">We make MTD compliance straightforward</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Once you are in scope you cannot stay on paper or a private spreadsheet. These packages put you on Xero or
          QuickBooks, register you for MTD where needed, and keep the quarterly calendar. Choose the support that
          matches how you work.
        </p>
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {[
            "Named accountant, not a rotating call centre",
            "Same-working-day reply before 3pm on Complete",
            "Xero or QuickBooks included",
            "Published monthly fee — no hourly surprise",
            "Individuals only: sole traders and personal landlords",
            "Self Assessment for 2025–26 still included",
          ].map((item) => (
            <li key={item} className="flex gap-2 rounded-xl border border-border bg-card p-4 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="packages" className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold">MTD is here. These two monthly packages cover it.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            MTD Comply from {formatMoney(comply.monthlyPrice ?? 0)} a month is the basic subscription. MTD Complete from{" "}
            {formatMoney(complete.monthlyPrice ?? 0)} a month is the accountant-managed option. Buy now takes you to
            checkout; choose the package if you want us to start onboarding first.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <PackageCard pkg={comply} />
            <PackageCard pkg={complete} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Not sure which package is right?</h2>
        <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
          Use the table, then start the monthly package that matches how hands-on you want to be.
        </p>
        <MtdPackageComparison comply={comply} complete={complete} />
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-semibold">How the packages keep you MTD-ready</h2>
            <ul className="mt-6 space-y-3">
              {READY.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Complete adds reviews, tax estimates and a named accountant on the phone. Need a personal return only,
              with no quarterly MTD yet? Use{" "}
              <Link href="/self-assessment-tax-returns/" className="font-medium text-primary underline-offset-2 hover:underline">
                Self Assessment packages
              </Link>
              .
            </p>
          </div>
          <SitePhoto
            src="/images/digital-tax-desk.png"
            alt="Laptop, receipts and invoices ready for quarterly MTD updates"
            className="aspect-[16/10] min-h-[14rem]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl font-semibold">Questions before you subscribe</h2>
        <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
          More on who is in scope sits on the{" "}
          <Link href="/making-tax-digital-for-income-tax/" className="font-medium text-primary underline-offset-2 hover:underline">
            MTD for Income Tax
          </Link>{" "}
          page.
        </p>
        <FAQAccordion items={MTD_FAQS} />
      </section>
      <ServicePageEnd slug="mtd-packages" skipFaq />
    </>
  );
}
