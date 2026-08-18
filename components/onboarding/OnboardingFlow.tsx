"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { PersonalDetailsStep } from "./steps/PersonalDetailsStep";
import { DeliveryAddressStep } from "./steps/DeliveryAddressStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { CompleteStep } from "./steps/CompleteStep";
import { emptyProfile, useProfile, type OnboardingDraft } from "@/lib/ProfileContext";

type Step = 1 | 2 | 3 | "done";

export function OnboardingFlow() {
  const router = useRouter();
  const { completeOnboarding } = useProfile();
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyProfile);

  const patch = (update: Partial<OnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...update }));

  const finish = (final: OnboardingDraft) => {
    completeOnboarding(final);
    setDraft(final);
    setStep("done");
  };

  if (step === "done") {
    return (
      <OnboardingShell>
        <CompleteStep draft={draft} onDone={() => router.push("/")} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      totalSteps={3}
      onBack={step > 1 ? () => setStep((s) => ((s as number) - 1) as Step) : undefined}
    >
      {step === 1 && (
        <PersonalDetailsStep
          draft={draft}
          onChange={patch}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <DeliveryAddressStep
          draft={draft}
          onChange={patch}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <PreferencesStep
          draft={draft}
          onChange={patch}
          onFinish={() => finish(draft)}
          onSkip={() =>
            finish({ ...draft, dietaryPreferences: [], favoriteCuisines: [] })
          }
        />
      )}
    </OnboardingShell>
  );
}
