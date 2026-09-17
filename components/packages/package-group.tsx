import { PackageCard } from "./package-card";
import type { Package, PackageGroup } from "@/lib/packages/types";

export function PackageGroupSection({
  group,
  packages,
}: {
  group: PackageGroup;
  packages: Package[];
}) {
  return (
    <section id={group.id} className="scroll-mt-24">
      <h3 className="font-heading text-2xl font-semibold text-primary">{group.name}</h3>
      <p className="mt-2 max-w-3xl text-muted-foreground">{group.summary}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}
