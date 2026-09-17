import { randomUUID } from "node:crypto";
import { FIRM_ID } from "@/lib/tax-returns/types";
import { nowIso } from "@/lib/tax-returns/crypto";
import { store } from "@/lib/tax-returns/store";
import { getPublishedCatalog } from "@/lib/packages/backend";
import type { Package } from "@/lib/packages/types";
import { defaultStages, practiceStore } from "./store";
import type { PracticeInvoice, PromoCode } from "./types";

function origin(): string {
  return process.env.WINGATE_TAX_APP_URL || "http://127.0.0.1:43191";
}

export function applyPromo(amountGbp: number, promo: PromoCode | undefined): number {
  if (!promo || !promo.active) return amountGbp;
  if (promo.expiresAt && Date.parse(promo.expiresAt) < Date.now()) return amountGbp;
  if (promo.usageLimit != null && promo.used >= promo.usageLimit) return amountGbp;
  if (promo.kind === "percent") return Math.max(0, Math.round(amountGbp * (1 - promo.amount / 100) * 100) / 100);
  return Math.max(0, Math.round((amountGbp - promo.amount) * 100) / 100);
}

export function checkoutAmount(pkg: Package): number {
  if (pkg.billing === "annual" && pkg.annualPrice != null) return pkg.annualPrice;
  if (pkg.monthlyPrice != null) return pkg.monthlyPrice;
  if (pkg.annualPrice != null) return pkg.annualPrice;
  return 0;
}

export async function createPackageCheckout(input: {
  packageId: string;
  email: string;
  name: string;
  promoCode?: string;
  interval?: "month" | "quarter" | "year" | "once";
}): Promise<{ url?: string; sessionId: string; provider: "stripe" | "mock"; invoice: PracticeInvoice }> {
  const catalog = await getPublishedCatalog();
  const pkg = catalog.packages.find((item) => item.id === input.packageId);
  if (!pkg || !pkg.isActive) throw new Error("That package is not available.");
  const snap = await practiceStore.snapshot();
  const promo = input.promoCode
    ? snap.promos.find((row) => row.code.toUpperCase() === input.promoCode!.toUpperCase())
    : undefined;
  if (promo && promo.packageIds.length && !promo.packageIds.includes(pkg.id)) {
    throw new Error("That code does not apply to this package.");
  }
  const amount = applyPromo(checkoutAmount(pkg), promo);
  if (amount <= 0 && pkg.billing === "quote") throw new Error("This package is quote-only. Send an enquiry instead.");
  const invoice: PracticeInvoice = {
    id: `inv_${randomUUID()}`,
    firmId: FIRM_ID,
    number: await practiceStore.nextInvoiceNumber(),
    userId: (await store.getUserByEmail(input.email))?.id ?? null,
    email: input.email.toLowerCase(),
    packageId: pkg.id,
    packageName: pkg.name,
    amountGbp: amount,
    currency: "gbp",
    status: "pending",
    stripePaymentId: null,
    stripeCustomerId: null,
    stripeSessionId: null,
    promoCode: promo?.code ?? null,
    createdAt: nowIso(),
    paidAt: null,
  };
  const secret = process.env.STRIPE_SECRET_KEY;
  const recurring = input.interval && input.interval !== "once";
  if (secret && amount > 0) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(secret);
      const session = await stripe.checkout.sessions.create({
        mode: recurring ? "subscription" : "payment",
        success_url: `${origin()}/checkout/complete/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin()}/checkout/?package=${pkg.slug}&abandoned=1`,
        customer_email: input.email,
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: 1,
            price_data: recurring
              ? {
                  currency: "gbp",
                  unit_amount: Math.round(amount * 100),
                  product_data: { name: pkg.name },
                  recurring: {
                    interval: input.interval === "year" ? "year" : "month",
                    interval_count: input.interval === "quarter" ? 3 : 1,
                  },
                }
              : {
                  currency: "gbp",
                  unit_amount: Math.round(amount * 100),
                  product_data: { name: pkg.name },
                },
          },
        ],
        metadata: { invoiceId: invoice.id, packageId: pkg.id, firmId: FIRM_ID, name: input.name },
      });
      invoice.stripeSessionId = session.id;
      await practiceStore.saveInvoice(invoice);
      return { provider: "stripe", url: session.url ?? undefined, sessionId: session.id, invoice };
    } catch (error) {
      console.warn("Stripe checkout failed, using mock.", error);
    }
  }
  const sessionId = `mock_${randomUUID()}`;
  invoice.stripeSessionId = sessionId;
  await practiceStore.saveInvoice(invoice);
  return { provider: "mock", sessionId, invoice, url: `${origin()}/checkout/complete/?session_id=${sessionId}&mock=1` };
}

export async function markInvoicePaid(invoice: PracticeInvoice, stripePaymentId?: string, stripeCustomerId?: string) {
  const paid: PracticeInvoice = {
    ...invoice,
    status: "paid",
    paidAt: nowIso(),
    stripePaymentId: stripePaymentId ?? invoice.stripePaymentId,
    stripeCustomerId: stripeCustomerId ?? invoice.stripeCustomerId,
  };
  await practiceStore.saveInvoice(paid);
  return paid;
}

export function jobFromPayment(invoice: PracticeInvoice, clientId: string, clientName: string) {
  return {
    id: `job_${randomUUID()}`,
    firmId: FIRM_ID,
    clientId,
    clientName,
    packageId: invoice.packageId,
    packageName: invoice.packageName,
    status: "paid" as const,
    assignedStaffId: "usr_accountant",
    progress: 10,
    stages: defaultStages(invoice.packageName),
    notes: "",
    dueAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}
