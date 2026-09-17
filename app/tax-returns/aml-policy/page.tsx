import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "AML policy – Wingate Accountants Ltd" },
  description: "How Wingate Accountants Limited checks identity before preparing a Self Assessment.",
};

export default function AmlPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/tax-returns/">← Tax returns</Link>
      </p>
      <h1 className="font-heading mt-4 text-4xl font-bold">Anti-money laundering policy</h1>
      <div className="cms-body">
        <p>
          {SITE.legalName} must identify clients before we act as tax agents. This page describes the identity pack for a Wingate Self Assessment engagement.
        </p>
        <h2>What we ask for</h2>
        <ul>
          <li>One photo identity document: passport or driving licence.</li>
          <li>Two proofs of address dated within the last three months: bank statement, utility bill, council tax or a government letter.</li>
          <li>An optional live selfie. A person at the firm confirms the face matches the identity document. We do not send images to a biometric vendor.</li>
        </ul>
        <h2>Review</h2>
        <p>
          Staff review the pack, record a simple risk band (low, medium or high) and approve or reject before we file with
          HMRC. New returns stay in the portal until AML is approved.
        </p>
        <h2>Retention</h2>
        <p>
          Identity records are kept with the tax file for five years after the engagement ends, in line with UK AML
          requirements. Contact {SITE.email} if you need a copy of what we hold.
        </p>
      </div>
    </article>
  );
}
