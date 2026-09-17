"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addOnPriceLabel, packagePriceLabel } from "@/lib/packages/catalog";
import type { AddOn, Package } from "@/lib/packages/types";
import { SITE } from "@/lib/site";

export function PackageStartForm({
  packages,
  addons,
  initialPackage,
  initialAddon,
}: {
  packages: Package[];
  addons: AddOn[];
  initialPackage?: string;
  initialAddon?: string;
}) {
  const router = useRouter();
  const [packageId, setPackageId] = useState(() => {
    const match = packages.find((item) => item.slug === initialPackage || item.id === initialPackage);
    return match?.id ?? packages[0]?.id ?? "";
  });
  const [addonIds, setAddonIds] = useState<string[]>(() => {
    const found = addons.find((item) => item.slug === initialAddon || item.id === initialAddon);
    return found ? [found.id] : [];
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  const selected = packages.find((item) => item.id === packageId);

  function toggleAddon(id: string) {
    setAddonIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("saving");
    setError("");
    try {
      const response = await fetch("/api/package-selection/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          addonIds,
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          companyName: String(data.get("companyName") || ""),
          notes: String(data.get("notes") || ""),
        }),
      });
      const json = (await response.json()) as { error?: string; nextPath?: string };
      if (!response.ok) throw new Error(json.error || "Could not save your selection.");
      router.push(json.nextPath || "/contact-us/");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save your selection.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="packageId" className="text-sm font-medium">
          Package
        </label>
        <select
          id="packageId"
          name="packageId"
          className="mt-1.5 h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={packageId}
          onChange={(event) => setPackageId(event.target.value)}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} — {packagePriceLabel(pkg)}
            </option>
          ))}
        </select>
        {selected ? <p className="mt-2 text-sm text-muted-foreground">{selected.idealFor}</p> : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Add-ons (optional)</legend>
        <div className="mt-2 space-y-2">
          {addons.map((addon) => (
            <label key={addon.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={addonIds.includes(addon.id)}
                onChange={() => toggleAddon(addon.id)}
              />
              <span>
                <span className="font-medium">{addon.name}</span>
                <span className="text-muted-foreground"> — {addOnPriceLabel(addon)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Full name
        </label>
        <Input id="name" name="name" required className="mt-1.5 h-10" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required className="mt-1.5 h-10" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input id="phone" name="phone" type="tel" className="mt-1.5 h-10" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="companyName" className="text-sm font-medium">
          Business or company name <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input id="companyName" name="companyName" className="mt-1.5 h-10" autoComplete="organization" />
      </div>
      <div>
        <label htmlFor="notes" className="text-sm font-medium">
          Anything we should know
        </label>
        <Textarea id="notes" name="notes" className="mt-1.5 min-h-24" />
      </div>

      {status === "error" ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="h-11 w-full" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Continue onboarding"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Sole trader, landlord (personal) and Self Assessment packages continue in the tax returns portal for identity checks.
        Company packages are confirmed by the practice team at {SITE.email}.
      </p>
    </form>
  );
}
