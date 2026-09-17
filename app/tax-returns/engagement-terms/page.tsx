import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Engagement terms – Wingate Accountants Ltd" },
  description: "Standard terms for a Self Assessment engagement with Wingate Accountants Limited.",
};

export default function EngagementTermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/tax-returns/">← Tax returns</Link>
      </p>
      <h1 className="font-heading mt-4 text-4xl font-bold">Engagement terms</h1>
      <div className="cms-body">
        <p>
          These terms apply when you buy a tax-return plan from {SITE.legalName}. Your signed letter of
          engagement (generated in the portal) is the agreement for the named tax year. Work and messages stay between you and your Wingate accountant.
        </p>
        <h2>Our work</h2>
        <p>
          We collect your questionnaire and documents, prepare the Self Assessment, send you a summary to approve, and
          file with HMRC. You remain legally responsible for the return.
        </p>
        <h2>Making Tax Digital</h2>
        <p>
          MTD for Income Tax bridging is in development. Until live HMRC credentials are connected, the portal stores a
          filing receipt from the submission service used in this module so you can see the step complete.
        </p>
        <h2>Fees and extras</h2>
        <p>
          Plan fees are payable before work starts. HMRC enquiries, prior-year amendments and unprompted disclosures are
          quoted separately.
        </p>
        <h2>Contact</h2>
        <p>
          {SITE.address}. {SITE.email}. Company {SITE.companyNumber}. ICO {SITE.ico}.
        </p>
      </div>
    </article>
  );
}
