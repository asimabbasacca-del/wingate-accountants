import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/tax-returns/account-page";
import { SignUpForm } from "@/components/tax-returns/account-forms";

export const metadata: Metadata = {
  title: { absolute: "Sign up – Wingate Accountants Ltd" },
};

export default function SignUpPage() {
  return (
    <AccountPage
      title="Create your client account"
      intro="Sign up to buy an Online Tax Return Preparation Service package, then verify your email before you open My Tax Portal."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <SignUpForm />
      </Suspense>
    </AccountPage>
  );
}
