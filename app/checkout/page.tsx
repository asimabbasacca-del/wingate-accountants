import type { Metadata } from "next";
import { CheckoutForm } from "@/components/practice/checkout-form";
import { getPublishedCatalog } from "@/lib/packages/backend";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Checkout – Wingate Accountants Ltd" },
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; abandoned?: string }>;
}) {
  const params = await searchParams;
  const catalog = await getPublishedCatalog();
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-heading text-3xl font-bold">Pay with Stripe</h1>
      <p className="mt-3 text-muted-foreground">
        Cards, Apple Pay, Google Pay and Link are collected on Stripe-hosted Checkout. Wingate never stores card numbers.
      </p>
      <CheckoutForm
        packages={catalog.packages.filter((item) => item.isActive)}
        initial={params.package}
        abandoned={params.abandoned === "1"}
      />
    </div>
  );
}
