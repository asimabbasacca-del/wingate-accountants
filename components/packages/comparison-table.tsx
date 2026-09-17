import { packagePriceLabel, packagePricePeriod } from "@/lib/packages/catalog";
import type { Package } from "@/lib/packages/types";

const COLUMNS = [
  { key: "name", label: "Package" },
  { key: "clientType", label: "Client type" },
  { key: "price", label: "Price" },
  { key: "yearEndAccounts", label: "Year-end accounts" },
  { key: "taxReturns", label: "Tax returns included" },
  { key: "vatSupport", label: "VAT support" },
  { key: "payrollSupport", label: "Payroll support" },
  { key: "bookkeeping", label: "Bookkeeping" },
  { key: "cloudSoftware", label: "Cloud software" },
  { key: "supportLevel", label: "Support level" },
  { key: "responseTime", label: "Response time guarantee" },
] as const;

export function ComparisonTable({ packages }: { packages: Package[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
        <caption className="sr-only">Compare Wingate accountancy packages</caption>
        <thead>
          <tr className="border-b border-border bg-muted/70">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-3 py-3 font-medium ${col.key === "name" ? "sticky left-0 z-10 bg-muted/95 min-w-[10rem]" : "min-w-[9rem]"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id} className="border-b border-border last:border-0">
              <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-3 font-semibold text-primary">
                <a className="underline-offset-2 hover:underline" href={`#${pkg.slug}`}>
                  {pkg.name}
                </a>
              </th>
              <td className="px-3 py-3">{pkg.clientType}</td>
              <td className="px-3 py-3">
                {packagePriceLabel(pkg)}
                {packagePricePeriod(pkg) ? ` ${packagePricePeriod(pkg)}` : ""}
              </td>
              <td className="px-3 py-3">{pkg.comparison.yearEndAccounts}</td>
              <td className="px-3 py-3">{pkg.comparison.taxReturns}</td>
              <td className="px-3 py-3">{pkg.comparison.vatSupport}</td>
              <td className="px-3 py-3">{pkg.comparison.payrollSupport}</td>
              <td className="px-3 py-3">{pkg.comparison.bookkeeping}</td>
              <td className="px-3 py-3">{pkg.comparison.cloudSoftware}</td>
              <td className="px-3 py-3">{pkg.comparison.supportLevel}</td>
              <td className="px-3 py-3">{pkg.comparison.responseTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
