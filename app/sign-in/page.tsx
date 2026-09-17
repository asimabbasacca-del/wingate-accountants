import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/tax-returns/account-page";
import { SignInForm } from "@/components/tax-returns/account-forms";

export const metadata: Metadata = {
  title: { absolute: "Sign in – Wingate Accountants Ltd" },
};

export default function SignInPage() {
  return (
    <AccountPage
      title="Sign in to My Tax Portal"
      intro="Clients, staff, marketing, developers and admins use the same sign-in. You land on the dashboard for your role."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <SignInForm />
      </Suspense>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-6 text-xs text-muted-foreground">
          Demo: super@ / WingateSuper2026 · admin@ / WingateAdmin2026 · accountant@ / WingateStaff2026 · marketing@ /
          WingateMarketing2026 · developer@ / WingateDev2026 · client@ / WingateClient2026 (all @wingateaccountants.co.uk)
        </p>
      ) : null}
    </AccountPage>
  );
}
