import { NextRequest, NextResponse } from "next/server";
import { practiceStore } from "@/lib/practice/store";
import { markInvoicePaid } from "@/lib/practice/stripe";
import { runPaymentAutomation } from "@/lib/practice/automation";
import { clientIp, isProduction } from "@/lib/security/config";
import { rateLimit } from "@/lib/security/rate-limit";
import { securityLog } from "@/lib/security/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limited = rateLimit(`stripe-webhook:${clientIp(req)}`, 120, 60 * 1000);
  if (!limited.ok) {
    securityLog("rate_limited", { name: "stripe-webhook", ip: clientIp(req) });
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } });
  }
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET) as unknown as typeof event;
    } else if (!isProduction() && process.env.STRIPE_ALLOW_UNSIGNED_WEBHOOK === "1") {
      event = JSON.parse(raw) as typeof event;
    } else {
      securityLog("webhook_rejected", { reason: "unsigned_or_unconfigured" });
      return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
    }
  } catch {
    securityLog("webhook_rejected", { reason: "invalid_signature" });
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
  const obj = event.data?.object ?? {};
  const sessionId = String(obj.id || obj.checkout_session || "");
  const snap = await practiceStore.snapshot();
  const invoice = snap.invoices.find((row) => row.stripeSessionId === sessionId || row.stripePaymentId === String(obj.payment_intent || ""));
  const handled = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "invoice.paid",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "payment_intent.failed",
    "invoice.payment_failed",
    "charge.refunded",
  ];
  if (!handled.includes(event.type)) return NextResponse.json({ received: true });
  if (invoice && (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded" || event.type === "invoice.paid")) {
    if (invoice.status !== "paid") {
      const paid = await markInvoicePaid(invoice, String(obj.payment_intent || obj.id || ""), String(obj.customer || ""));
      await runPaymentAutomation(paid, String(obj.customer_details ? (obj.customer_details as { name?: string }).name : paid.email));
    }
  }
  if (invoice && (event.type === "payment_intent.failed" || event.type === "invoice.payment_failed")) {
    await practiceStore.saveInvoice({ ...invoice, status: "failed" });
  }
  if (invoice && event.type === "charge.refunded") {
    await practiceStore.saveInvoice({ ...invoice, status: "refunded" });
  }
  await practiceStore.audit("stripe", "stripe-webhook", event.type, sessionId || invoice?.number || "");
  return NextResponse.json({ received: true });
}
