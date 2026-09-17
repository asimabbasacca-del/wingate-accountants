import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/button-link";
import { choosePackageHref, formatMoney, getFeaturesForPackage, packagePriceLabel, packagePricePeriod } from "@/lib/packages/catalog";
import type { Package } from "@/lib/packages/types";

export function PackageCard({ pkg }: { pkg: Package }) {
  const features = getFeaturesForPackage(pkg);
  const period = packagePricePeriod(pkg);
  const cta = pkg.billing === "quote" ? "Request a quote" : "Choose this package";

  return (
    <article
      id={pkg.slug}
      className={`flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm sm:p-6 ${
        pkg.featured ? "border-accent ring-1 ring-accent/40" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge variant={pkg.featured ? "default" : "secondary"}>{pkg.clientType}</Badge>
        {pkg.featured ? (
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">Most chosen</p>
        ) : null}
      </div>
      <h3 className="font-heading mt-3 text-2xl font-semibold text-primary">{pkg.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
        {packagePriceLabel(pkg)}
        {period ? <span className="ml-1 text-sm font-normal text-muted-foreground">{period}</span> : null}
      </p>
      {pkg.annualPrice != null && pkg.billing === "monthly" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Or {formatMoney(pkg.annualPrice)} {pkg.vatNote} if you pay 12 months at once
        </p>
      ) : null}
      {pkg.priceNote ? <p className="mt-2 text-xs text-muted-foreground">{pkg.priceNote}</p> : null}

      <p className="mt-4 text-sm">
        <span className="font-medium">Ideal for: </span>
        <span className="text-muted-foreground">{pkg.idealFor}</span>
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {pkg.highlights.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {pkg.propertyBands ? (
        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[16rem] text-left text-sm">
            <caption className="sr-only">Monthly fees by number of properties</caption>
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Properties
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Monthly fee
                </th>
              </tr>
            </thead>
            <tbody>
              {pkg.propertyBands.map((band) => (
                <tr key={band.properties} className="border-t border-border">
                  <td className="px-3 py-2">{band.properties}</td>
                  <td className="px-3 py-2">
                    {band.monthlyPrice == null ? "Quote" : `${formatMoney(band.monthlyPrice)} + VAT`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <details className="group mt-5 rounded-lg border border-border bg-muted/30 p-3">
        <summary className="cursor-pointer text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">
          What’s included
        </summary>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature.id}>
              <span className="font-medium text-foreground">{feature.name}. </span>
              {feature.description}
            </li>
          ))}
        </ul>
        {pkg.exclusions.length ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-sm font-medium">Not in the monthly fee</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {pkg.exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </details>

      <div className="mt-6 grid gap-2">
        {pkg.billing !== "quote" ? (
          <ButtonLink href={`/checkout/?package=${pkg.slug}`} className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Buy now
          </ButtonLink>
        ) : null}
        <ButtonLink href={choosePackageHref(pkg)} variant={pkg.billing === "quote" ? "default" : "outline"} className="h-11 w-full">
          {cta}
        </ButtonLink>
      </div>
    </article>
  );
}
