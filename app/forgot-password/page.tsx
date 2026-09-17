import type { Metadata } from "next";
import { AccountPage } from "@/components/tax-returns/account-page";
import { ForgotPasswordForm } from "@/components/tax-returns/account-forms";

export const metadata: Metadata = {
  title: { absolute: "Forgot password – Wingate Accountants Ltd" },
};

export default function ForgotPasswordPage() {
  return (
    <AccountPage
      title="Forgot password"
      intro="Enter the email on your client account. We will send a reset code. Your existing tax file is not deleted."
    >
      <ForgotPasswordForm />
    </AccountPage>
  );
}
