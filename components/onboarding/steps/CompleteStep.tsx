"use client";

import LottieIcon from "@/components/LottieIcon";
import bicycleAnimation from "@/app/assets/lottie/bicicleta delivery.json";
import type { OnboardingDraft } from "@/lib/ProfileContext";

export function CompleteStep({
  draft,
  onDone,
}: {
  draft: OnboardingDraft;
  onDone: () => void;
}) {
  return (
    <div className="w-full text-center">
      <LottieIcon
        animationData={bicycleAnimation}
        className="mx-auto size-28"
        loop
      />

      <h1 className="mt-2 text-2xl font-medium text-neutral-900">
        You&apos;re all set, {draft.firstName || "there"}!
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        We&apos;ll deliver to {draft.address.line1 || "your address"}
        {draft.address.city ? `, ${draft.address.city}` : ""}.
      </p>

      {(draft.dietaryPreferences.length > 0 ||
        draft.favoriteCuisines.length > 0) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[...draft.dietaryPreferences, ...draft.favoriteCuisines].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Start ordering
      </button>
    </div>
  );
}
