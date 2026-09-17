import { Suspense } from "react";
import { OnboardingWizard } from "@/components/tax-returns/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted-foreground">Loading onboarding…</p>}>
      <OnboardingWizard />
    </Suspense>
  );
}
