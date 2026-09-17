import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/tax-returns/account-page";
import { VerifyEmailForm } from "@/components/tax-returns/account-forms";

export const metadata: Metadata = {
  title: { absolute: "Verify email – Wingate Accountants Ltd" },
};

export default function VerifyEmailPage() {
  return (
    <AccountPage
      title="Verify your email"
      intro="We send a six-digit code so only you can open the tax portal. Check your inbox, then sign in."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <VerifyEmailForm />
      </Suspense>
    </AccountPage>
  );
}
