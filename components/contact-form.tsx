"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getPackageBySlug, packagePriceLabel } from "@/lib/packages/catalog";
import { SITE } from "@/lib/site";

type Status = "idle" | "error";

export function ContactForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPackage = getPackageBySlug(searchParams.get("package") ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const defaultMessage = selectedPackage
    ? `I would like to start the ${selectedPackage.name} package (${packagePriceLabel(selectedPackage)}).`
    : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      setStatus("error");
      return;
    }
    try {
      const response = await fetch("/api/practice/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: String(data.get("phone") || ""),
          serviceInterest: selectedPackage?.name || "General enquiry",
          message,
          source: "website",
        }),
      });
      if (!response.ok) throw new Error("Could not save the enquiry");
      router.push("/thank-you/");
    } catch {
      const subject = encodeURIComponent(
        selectedPackage ? `Package enquiry: ${selectedPackage.name}` : `Enquiry from ${name}`,
      );
      const body = encodeURIComponent(`${message}\n\n${name}\n${email}\n${data.get("phone") || ""}`);
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
      {selectedPackage ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm">
          Package selected: <span className="font-medium">{selectedPackage.name}</span>
        </p>
      ) : null}
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" required className="mt-1.5" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" required className="mt-1.5" autoComplete="email" />
      </div>
      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input id="phone" name="phone" type="tel" className="mt-1.5" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          How can we help?
        </label>
        <Textarea id="message" name="message" required className="mt-1.5 min-h-32" defaultValue={defaultMessage} />
      </div>
      {status === "error" ? (
        <p className="text-sm text-destructive">Please add your name, email and a short message.</p>
      ) : null}
      <Button type="submit" className="h-10 px-4">
        Send to {SITE.email}
      </Button>
    </form>
  );
}
