import { MTD_COMPARISON } from "@/lib/mtd/content";
import { formatMoney } from "@/lib/packages/catalog";
import type { Package } from "@/lib/packages/types";

export function MtdPackageComparison({ comply, complete }: { comply: Package; complete: Package }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">Compare monthly MTD packages</caption>
        <thead>
          <tr className="border-b border-border bg-muted/70">
            <th scope="col" className="sticky left-0 z-10 min-w-[14rem] bg-muted/95 px-4 py-3 font-medium">
              What is included
            </th>
            <th scope="col" className="min-w-[11rem] px-4 py-3 font-medium">
              <a className="text-primary underline-offset-2 hover:underline" href={`#${comply.slug}`}>
                {comply.name}
              </a>
              <p className="mt-1 text-base font-semibold text-foreground">
                {formatMoney(comply.monthlyPrice ?? 0)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">per month</span>
              </p>
            </th>
            <th scope="col" className="min-w-[11rem] px-4 py-3 font-medium">
              <a className="text-primary underline-offset-2 hover:underline" href={`#${complete.slug}`}>
                {complete.name}
              </a>
              <p className="mt-1 text-base font-semibold text-foreground">
                {formatMoney(complete.monthlyPrice ?? 0)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">per month</span>
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {MTD_COMPARISON.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 font-medium">
                {row.label}
              </th>
              <td className="px-4 py-3 text-muted-foreground">{row.comply}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.complete}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
