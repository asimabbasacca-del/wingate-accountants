"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function CheckoutComplete() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Confirming your payment…");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setMessage("Missing checkout session.");
      return;
    }
    fetch("/api/practice/checkout/complete/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        const json = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(json.error || "Could not confirm payment");
        setMessage("Payment received. We have created your client portal, engagement letter, document request and onboarding job.");
      })
      .catch((err: Error) => setMessage(err.message));
  }, [params]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold">Checkout</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
      <Link href="/sign-in/" className="mt-8 inline-block text-sm font-medium text-primary">
        Sign in to your portal
      </Link>
    </div>
  );
}
