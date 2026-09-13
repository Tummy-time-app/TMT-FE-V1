"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";
import { useVendorGuard } from "@/components/vendor-portal/useVendorGuard";
import { useCreateStoreMutation, useUpdateStoreProfileMutation } from "@/features/vendor/vendorApi";
import type { BusinessType, UpdateStoreProfilePayload, VendorRestaurant } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { BusinessBasicsStep } from "./steps/BusinessBasicsStep";
import { LocationContactStep } from "./steps/LocationContactStep";
import { BrandingOpsStep } from "./steps/BrandingOpsStep";
import { VendorCompleteStep } from "./steps/VendorCompleteStep";

/** Everything this wizard collects before a real store row exists. Kept as
 *  plain strings (even for numeric fields) so every input can bind
 *  directly — converted to the real payload shape only at submit time. */
export interface VendorOnboardingDraft {
  // Step 1 — business basics
  name: string;
  businessType: BusinessType;
  cuisine: string;
  description: string;
  // Step 2 — location & contact
  address: string;
  landmark: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  // Step 3 — branding & operations (all optional, skippable)
  logoUrl: string;
  coverImageUrl: string;
  additionalDirections: string;
  averagePrepTime: string;
  minimumOrder: string;
}

const emptyDraft: VendorOnboardingDraft = {
  name: "",
  businessType: "restaurant",
  cuisine: "",
  description: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  phone: "",
  email: "",
  logoUrl: "",
  coverImageUrl: "",
  additionalDirections: "",
  averagePrepTime: "",
  minimumOrder: "",
};

type Step = 1 | 2 | 3 | "done";

/**
 * Runs right after a vendor account verifies + logs in for the first time
 * (VendorDashboard redirects here whenever the owner has zero stores yet —
 * see its own doc comment) — this is what actually creates the store row,
 * replacing the old bare, single-field CreateStoreForm that used to sit
 * inline in the dashboard. Also reachable any time from the dashboard's
 * "Add another store" link, so it doubles as the general "create a new
 * store" flow, not just a one-time signup step.
 *
 * Two real mutations back this, not one: createStore (POST /api/restaurants)
 * only accepts the core identity fields restaurant-service requires up
 * front (name/address/phone/cuisine/imageUrl — see CreateStorePayload's
 * doc comment), so step 3's richer fields ride on a follow-up
 * updateStoreProfile call against the id the create just returned. If that
 * second call fails, the store still exists — this does not roll it back
 * or block completion, it just tells the vendor to finish up in Settings.
 */
export function VendorOnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { isSessionLoading, isAuthenticated, isVendor, isReady } = useVendorGuard();
  const [createStore] = useCreateStoreMutation();
  const [updateStoreProfile] = useUpdateStoreProfileMutation();

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<VendorOnboardingDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdStore, setCreatedStore] = useState<VendorRestaurant | null>(null);
  const [profileSaveFailed, setProfileSaveFailed] = useState(false);

  const patch = (update: Partial<VendorOnboardingDraft>) =>
    setDraft((prev) => ({ ...prev, ...update }));

  const submit = async (final: VendorOnboardingDraft) => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const store = await createStore({
        ownerId: user.id,
        name: final.name.trim(),
        address: final.address.trim(),
        phone: final.phone.trim() || undefined,
        cuisine: final.cuisine.trim() || undefined,
        imageUrl: final.logoUrl.trim() || undefined,
      }).unwrap();

      const profilePatch: UpdateStoreProfilePayload["patch"] = {};
      if (final.businessType) profilePatch.businessType = final.businessType;
      if (final.description.trim()) profilePatch.description = final.description.trim();
      if (final.landmark.trim()) profilePatch.landmark = final.landmark.trim();
      if (final.city.trim()) profilePatch.city = final.city.trim();
      if (final.state.trim()) profilePatch.state = final.state.trim();
      if (final.email.trim()) profilePatch.email = final.email.trim();
      if (final.logoUrl.trim()) profilePatch.logoUrl = final.logoUrl.trim();
      if (final.coverImageUrl.trim()) profilePatch.coverImageUrl = final.coverImageUrl.trim();
      if (final.additionalDirections.trim()) profilePatch.additionalDirections = final.additionalDirections.trim();
      if (final.averagePrepTime.trim()) profilePatch.averagePrepTime = Number(final.averagePrepTime);
      if (final.minimumOrder.trim()) profilePatch.minimumOrder = Number(final.minimumOrder);

      let finishedStore = store;
      if (Object.keys(profilePatch).length > 0) {
        try {
          finishedStore = await updateStoreProfile({ id: store.id, patch: profilePatch }).unwrap();
        } catch {
          // The store itself was created successfully — don't treat a
          // failed follow-up patch as a failed signup. Flag it instead so
          // the complete step can point them at Settings to finish up.
          setProfileSaveFailed(true);
        }
      }

      setCreatedStore(finishedStore);
      setStep("done");
    } catch (err) {
      setSubmitError(normalizeApiError(err as never).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionLoading || !isReady) {
    return (
      <OnboardingShell>
        <p className="py-20 text-center text-sm text-neutral-400">Loading…</p>
      </OnboardingShell>
    );
  }

  if (!isAuthenticated) {
    // useVendorGuard already kicks off the redirect to /login; this is
    // just the frame shown for the moment before that navigation lands.
    return (
      <OnboardingShell>
        <p className="py-20 text-center text-sm text-neutral-400">Redirecting to login…</p>
      </OnboardingShell>
    );
  }

  if (!isVendor) {
    return (
      <OnboardingShell>
        <div className="w-full text-center">
          <h1 className="text-2xl font-medium text-neutral-900">This isn&apos;t a vendor account</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Register a restaurant account to set up a store on TummyTime.
          </p>
          <Link
            href="/vendor/signup"
            className="mt-6 inline-block w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Register your restaurant
          </Link>
        </div>
      </OnboardingShell>
    );
  }

  if (step === "done") {
    return (
      <OnboardingShell>
        {createdStore ? (
          <VendorCompleteStep
            store={createdStore}
            profileSaveFailed={profileSaveFailed}
            onDone={() => router.push(`/vendor/${createdStore.id}`)}
          />
        ) : (
          <p className="py-20 text-center text-sm text-neutral-400">Loading…</p>
        )}
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      step={step}
      totalSteps={3}
      onBack={step > 1 ? () => setStep((step - 1) as Step) : undefined}
    >
      {step === 1 && (
        <BusinessBasicsStep draft={draft} onChange={patch} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <LocationContactStep draft={draft} onChange={patch} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <BrandingOpsStep
          draft={draft}
          onChange={patch}
          isSubmitting={isSubmitting}
          error={submitError}
          onFinish={() => submit(draft)}
          onSkip={() =>
            submit({
              ...draft,
              logoUrl: "",
              coverImageUrl: "",
              additionalDirections: "",
              averagePrepTime: "",
              minimumOrder: "",
            })
          }
        />
      )}
    </OnboardingShell>
  );
}
