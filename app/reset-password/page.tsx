import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/tax-returns/account-page";
import { ResetPasswordForm } from "@/components/tax-returns/account-forms";

export const metadata: Metadata = {
  title: { absolute: "Reset password – Wingate Accountants Ltd" },
};

export default function ResetPasswordPage() {
  return (
    <AccountPage
      title="Choose a new password"
      intro="Use the code from your reset email, then sign in to My Tax Portal."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AccountPage>
  );
}
