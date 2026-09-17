import { ButtonLink } from "@/components/button-link";
import { addOnPriceLabel } from "@/lib/packages/catalog";
import type { AddOn } from "@/lib/packages/types";

export function AddOnCard({ addon }: { addon: AddOn }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <h3 className="font-heading text-xl font-semibold text-primary">{addon.name}</h3>
      <p className="mt-3 text-2xl font-semibold">{addOnPriceLabel(addon)}</p>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{addon.description}</p>
      <ButtonLink href={`/accountancy-packages/start/?addon=${encodeURIComponent(addon.slug)}`} className="mt-6 h-11">
        Add to your package
      </ButtonLink>
    </article>
  );
}
