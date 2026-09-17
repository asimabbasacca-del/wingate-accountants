import { randomUUID } from "node:crypto";
import { getPlan } from "./plans";
import { store } from "./store";
import { nowIso } from "./crypto";
import type { PlanId, TaxReturnOrder } from "./types";

export const PaymentService = {
  async selectPlan(order: TaxReturnOrder, planId: PlanId): Promise<TaxReturnOrder> {
    const plan = getPlan(planId);
    if (!plan) throw new Error("Unknown plan");
    if (order.payment.status === "paid") return order;
    return store.saveOrder({
      ...order,
      planId,
      amountGbp: plan.amountGbp,
      status: "payment_pending",
    });
  },

  async checkout(order: TaxReturnOrder): Promise<{ provider: "stripe" | "mock"; url?: string; sessionId: string }> {
    const secret = process.env.STRIPE_SECRET_KEY;
    const origin = process.env.WINGATE_TAX_APP_URL || "http://127.0.0.1:43191";
    if (secret) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(secret);
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          success_url: `${origin}/tax-returns/onboarding/?paid=1`,
          cancel_url: `${origin}/tax-returns/onboarding/?paid=0`,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "gbp",
                unit_amount: Math.round(order.amountGbp * 100),
                product_data: { name: `Wingate Self Assessment — ${order.taxYear}` },
              },
            },
          ],
          metadata: { orderId: order.id, firmId: order.firmId },
        });
        await store.saveOrder({
          ...order,
          payment: { provider: "stripe", status: "pending", sessionId: session.id, paidAt: null },
        });
        return { provider: "stripe", url: session.url ?? undefined, sessionId: session.id };
      } catch {
        // Stripe package or keys unavailable — use the local checkout.
      }
    }
    const sessionId = `mock_${randomUUID()}`;
    await store.saveOrder({
      ...order,
      payment: { provider: "mock", status: "pending", sessionId, paidAt: null },
    });
    return { provider: "mock", sessionId };
  },

  async confirm(order: TaxReturnOrder, sessionId?: string): Promise<TaxReturnOrder> {
    if (order.payment.provider === "stripe" && process.env.STRIPE_SECRET_KEY && sessionId) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") throw new Error("Stripe payment is not complete");
        if (order.payment.sessionId && session.id !== order.payment.sessionId) {
          throw new Error("Checkout session does not match this file");
        }
      } catch (err) {
        if (err instanceof Error && (err.message.includes("not complete") || err.message.includes("does not match"))) throw err;
        throw new Error("Stripe confirmation failed. Check STRIPE_SECRET_KEY or wait for the webhook.");
      }
    } else if (order.payment.provider === "mock") {
      const expected = order.payment.sessionId;
      if (!sessionId || !expected || sessionId !== expected || !sessionId.startsWith("mock_")) {
        throw new Error("Mock checkout session is not valid");
      }
    } else {
      throw new Error("Payment is not confirmed");
    }
    return store.saveOrder({
      ...order,
      status: "paid",
      payment: {
        ...order.payment,
        status: "paid",
        sessionId: sessionId || order.payment.sessionId,
        paidAt: nowIso(),
      },
    });
  },
};
