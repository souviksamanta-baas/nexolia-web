import { Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function ComenzarPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWizard />
    </Suspense>
  );
}
