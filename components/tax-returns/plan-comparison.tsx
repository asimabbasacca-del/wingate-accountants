import { Check, Minus } from "lucide-react";
import { PLAN_COMPARISON, PLANS } from "@/lib/tax-returns/plans";

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span>{value}</span>;
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-primary">
        <Check className="size-4" aria-hidden />
        Included
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Minus className="size-4" aria-hidden />
      —
    </span>
  );
}

export function TaxReturnPlanComparison() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">Compare Wingate Self Assessment packages</caption>
        <thead>
          <tr className="border-b border-border bg-muted/70">
            <th scope="col" className="sticky left-0 z-10 min-w-[14rem] bg-muted/95 px-4 py-3 font-medium">
              What you get
            </th>
            {PLANS.map((plan) => (
              <th key={plan.id} scope="col" className="min-w-[11rem] px-4 py-3 font-medium">
                <a className="text-primary underline-offset-2 hover:underline" href={`#plan-${plan.id}`}>
                  {plan.name}
                </a>
                <p className="mt-1 text-base font-semibold text-foreground">{plan.priceLabel}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_COMPARISON.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-0">
              <th scope="row" className="sticky left-0 z-10 bg-card px-4 py-3 font-medium">
                {row.label}
              </th>
              <td className="px-4 py-3">
                <Cell value={row.prepared} />
              </td>
              <td className="px-4 py-3">
                <Cell value={row.optimised} />
              </td>
              <td className="px-4 py-3">
                <Cell value={row.partner} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
