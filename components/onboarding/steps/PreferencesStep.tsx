"use client";

import { Chip } from "@/components/ui/Chip";
import { cuisineOptions, dietaryOptions } from "@/lib/foodPreferences";
import type { OnboardingDraft } from "@/lib/ProfileContext";
import { toggleValue } from "@/lib/utils/array";

export function PreferencesStep({
  draft,
  onChange,
  onFinish,
  onSkip,
}: {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onFinish: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-medium text-neutral-900">
        What do you love to eat?
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Optional — helps us recommend restaurants you&apos;ll like.
      </p>

      <div className="mt-6">
        <h2 className="text-xs font-medium text-neutral-500">
          Dietary preferences
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {dietaryOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={draft.dietaryPreferences.includes(option)}
              onClick={() =>
                onChange({
                  dietaryPreferences: toggleValue(
                    draft.dietaryPreferences,
                    option,
                  ),
                })
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-medium text-neutral-500">
          Favorite cuisines
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {cuisineOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={draft.favoriteCuisines.includes(option)}
              onClick={() =>
                onChange({
                  favoriteCuisines: toggleValue(draft.favoriteCuisines, option),
                })
              }
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="mt-8 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Finish
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="mt-3 w-full text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        Skip for now
      </button>
    </div>
  );
}
