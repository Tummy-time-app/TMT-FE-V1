"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { OnboardingShell } from "./OnboardingShell";
import { PersonalDetailsStep } from "./steps/PersonalDetailsStep";
import { DeliveryAddressStep } from "./steps/DeliveryAddressStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { CompleteStep } from "./steps/CompleteStep";
import { emptyProfile, useProfile, type OnboardingDraft } from "@/lib/ProfileContext";

type Step = 1 | 2 | 3 | "done";

/** Splits the single "full name" collected at signup into onboarding's separate fields, so it doesn't have to be retyped. */
function splitName(name: string): Pick<OnboardingDraft, "firstName" | "lastName"> {
  const [firstName = "", ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { completeOnboarding } = useProfile();
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyProfile);

  // Onboarding collects data for an authenticated account — bounce anyone
  // who lands here without a session (e.g. a bookmarked/typed URL) rather
  // than let them fill it out attached to nobody.
  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/onboarding");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  // Prefill the name collected at signup once the session resolves.
  useEffect(() => {
    if (user) setDraft((prev) => ({ ...prev, ...splitName(user.name) }));
  }, [user]);

  const patch = (update: Partial<OnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...update }));

  const finish = (final: OnboardingDraft) => {
    completeOnboarding(final);
    setDraft(final);
    setStep("done");
  };

  if (isSessionLoading || !isAuthenticated) {
    return (
      <OnboardingShell>
        <p className="py-20 text-center text-sm text-neutral-400">Loading…</p>
      </OnboardingShell>
    );
  }

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
