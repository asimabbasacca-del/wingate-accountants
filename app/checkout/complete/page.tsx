import { Suspense } from "react";
import { CheckoutComplete } from "@/components/practice/checkout-complete";

export const dynamic = "force-dynamic";

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<p className="px-4 py-20 text-center text-sm">Confirming…</p>}>
      <CheckoutComplete />
    </Suspense>
  );
}
