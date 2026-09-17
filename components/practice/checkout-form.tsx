"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { packagePriceLabel } from "@/lib/packages/catalog";
import type { Package } from "@/lib/packages/types";

export function CheckoutForm({
  packages,
  initial,
  abandoned,
}: {
  packages: Package[];
  initial?: string;
  abandoned?: boolean;
}) {
  const [packageId, setPackageId] = useState(() => {
    const match = packages.find((item) => item.slug === initial || item.id === initial);
    return match?.id ?? packages[0]?.id ?? "";
  });
  const [status, setStatus] = useState(
    abandoned ? "Checkout was not completed. Pay below, or ask us to email a reminder." : "",
  );
  const selected = packages.find((item) => item.id === packageId);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("Opening checkout…");
    const response = await fetch("/api/practice/checkout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId,
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        promoCode: String(data.get("promoCode") || ""),
        interval: String(data.get("interval") || "once"),
      }),
    });
    const json = (await response.json()) as { error?: string; url?: string };
    if (!response.ok) {
      setStatus(json.error || "Checkout failed");
      return;
    }
    if (json.url) window.location.href = json.url;
    else setStatus("Checkout did not return a URL.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
      <label className="block text-sm font-medium">
        Package
        <select
          className="mt-1.5 h-10 w-full rounded-lg border border-input px-2 text-sm"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} — {packagePriceLabel(pkg)}
            </option>
          ))}
        </select>
      </label>
      {selected?.billing !== "quote" ? (
        <label className="block text-sm font-medium">
          Billing
          <select name="interval" className="mt-1.5 h-10 w-full rounded-lg border border-input px-2 text-sm" defaultValue="once">
            <option value="once">One-off</option>
            <option value="month">Monthly subscription</option>
            <option value="quarter">Quarterly subscription</option>
            <option value="year">Annual subscription</option>
          </select>
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">This package is quote-only.</p>
      )}
      <Input name="name" required placeholder="Full name" />
      <Input name="email" type="email" required placeholder="Email" />
      <Input name="promoCode" placeholder="Promo code (TAX25, SAVE10, NEWCLIENT50)" />
      <Button type="submit" className="h-11 w-full bg-accent text-accent-foreground">
        Buy now
      </Button>
      {abandoned ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={async (event) => {
            const form = event.currentTarget.form;
            if (!form) return;
            const data = new FormData(form);
            const email = String(data.get("email") || "");
            if (!email) {
              setStatus("Enter your email so we can send the reminder.");
              return;
            }
            const response = await fetch("/api/practice/checkout/abandon/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ packageId, name: String(data.get("name") || ""), email }),
            });
            if (!response.ok) {
              setStatus("Could not save the reminder.");
              return;
            }
            setStatus("We have logged this as an abandoned checkout. Staff can send the follow-up from Payments.");
          }}
        >
          Email me a reminder instead
        </Button>
      ) : null}
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </form>
  );
}
