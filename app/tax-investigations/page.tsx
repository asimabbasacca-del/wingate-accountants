import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Scale, FileSearch, Handshake } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { InvestigationSidebar } from "@/components/investigations/sidebar";
import { INVESTIGATION_GROUPS } from "@/lib/investigations/data";
import { investigationPath, topicsForGroup } from "@/lib/investigations/catalog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Tax Investigations and Compliance | Wingate Accountants" },
  description:
    "HMRC enquiry, COP9, VAT and PAYE investigations, voluntary disclosure and Tax Tribunal support from Wingate Accountants Ltd, 128 City Road, London.",
  alternates: { canonical: `${SITE.url}/tax-investigations/` },
};

const PROMISES = [
  {
    icon: FileSearch,
    title: "We take the correspondence",
    text: "HMRC writes to us. You stay informed. You decide any settlement.",
  },
  {
    icon: Scale,
    title: "Powers have limits",
    text: "We check what they are entitled to see before anyone sends a box of records.",
  },
  {
    icon: ShieldCheck,
    title: "Keep it civil",
    text: "Handled badly, a letter becomes COP9 or worse. We work to keep the case in a financial settlement.",
  },
  {
    icon: Handshake,
    title: "Compliance afterwards",
    text: "We are your accountants, not a one-off investigation boutique. Returns and accounts stay with the same firm.",
  },
];

export default function TaxInvestigationsHubPage() {
  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-medium tracking-wide text-accent uppercase">{SITE.legalName}</p>
          <h1 className="font-heading mt-3 max-w-4xl text-4xl leading-tight font-bold sm:text-5xl">
            Tax Investigations and compliance
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            If HMRC has opened an enquiry, sent a nudge letter, or you need to put historic tax right, a named
            accountant at Wingate takes the file. Same working-day reply if you contact us before 3pm.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact-us/" className="h-12 bg-accent px-6 text-base text-accent-foreground hover:bg-accent/90">
              Free confidential discussion
            </ButtonLink>
            <ButtonLink
              href="tel:+441615314179"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-6 text-primary-foreground hover:bg-white/10 hover:text-white"
            >
              Call {SITE.phone}
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <InvestigationSidebar />
        <div>
          <p className="text-muted-foreground">
            HMRC enquiries range from a single question on a Self Assessment box to a Fraud Investigation Service
            case. The pages on the left cover the same ground as a specialist investigation practice — written for
            Wingate clients in London and nationwide, and tied into the filings we already do for you.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PROMISES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
                <item.icon className="size-5 text-accent" aria-hidden />
                <h2 className="font-heading mt-3 text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          {INVESTIGATION_GROUPS.map((group) => (
            <section key={group.id} className="mt-14">
              <h2 className="font-heading text-2xl font-semibold">{group.name}</h2>
              <p className="mt-2 text-muted-foreground">{group.summary}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {topicsForGroup(group.id).map((topic) => (
                  <li key={topic.slug}>
                    <Link
                      href={investigationPath(topic.slug)}
                      className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 hover:shadow-md"
                    >
                      <h3 className="font-heading font-semibold">{topic.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{topic.summary}</p>
                      <span className="mt-4 text-sm font-medium text-primary">Read this page</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="mt-14 rounded-2xl border border-border bg-secondary/40 p-6">
            <h2 className="font-heading text-2xl font-semibold">Already disclosing, or already a client?</h2>
            <p className="mt-2 text-muted-foreground">
              Landlords and others coming forward on undeclared income can also use our{" "}
              <Link href="/hmrc-tax-disclosure-london/" className="font-medium text-primary underline-offset-2 hover:underline">
                HMRC tax disclosure
              </Link>{" "}
              service. Ongoing accounts and Self Assessment sit on{" "}
              <Link href="/accountancy-packages/" className="font-medium text-primary underline-offset-2 hover:underline">
                accountancy packages
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
