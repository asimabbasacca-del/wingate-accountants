import { Check } from "lucide-react";
import { StartNowButton } from "@/components/tax-returns/start-now-button";
import { PLANS } from "@/lib/tax-returns/plans";

export function TaxReturnPlanCards() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {PLANS.map((plan, index) => (
        <article
          key={plan.id}
          id={`plan-${plan.id}`}
          className={`flex flex-col rounded-2xl border bg-card p-6 ${index === 1 ? "border-accent shadow-md" : "border-border"}`}
        >
          {index === 1 ? (
            <p className="text-xs font-semibold tracking-wide text-accent uppercase">Most people choose this</p>
          ) : null}
          <h3 className="font-heading mt-2 text-2xl font-semibold">{plan.name}</h3>
          <p className="mt-2 text-3xl font-semibold">{plan.priceLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.billing === "month" ? "Billed monthly, year round." : "One fee for the 2025–26 tax year."}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{plan.tagline}</p>
          <p className="mt-2 text-sm">
            <span className="font-medium">Best for: </span>
            {plan.bestFor}
          </p>
          <ul className="mt-5 flex-1 space-y-2 text-sm">
            {plan.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <StartNowButton planId={plan.id} className="mt-6 h-11">
            Start this package
          </StartNowButton>
        </article>
      ))}
    </div>
  );
}
