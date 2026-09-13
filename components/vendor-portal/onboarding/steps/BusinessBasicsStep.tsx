"use client";

import { Chip } from "@/components/ui/Chip";
import { cuisineOptions } from "@/lib/foodPreferences";
import type { BusinessType } from "@/features/vendor/types";
import type { VendorOnboardingDraft } from "../VendorOnboardingFlow";

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "grocery", label: "Grocery" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

export function BusinessBasicsStep({
  draft,
  onChange,
  onNext,
}: {
  draft: VendorOnboardingDraft;
  onChange: (patch: Partial<VendorOnboardingDraft>) => void;
  onNext: () => void;
}) {
  const canContinue = draft.name.trim().length > 0;

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <h1 className="text-2xl font-medium text-neutral-900">Tell us about your business</h1>
      <p className="mt-1 text-sm text-neutral-500">This is how customers will see you on TummyTime.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="businessName" className="sr-only">
            Business name
          </label>
          <input
            id="businessName"
            type="text"
            autoComplete="organization"
            placeholder="Business name"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <h2 className="text-xs font-medium text-neutral-500">Business type</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {businessTypes.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                selected={draft.businessType === type.value}
                onClick={() => onChange({ businessType: type.value })}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-medium text-neutral-500">Cuisine or category (optional)</h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {cuisineOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={draft.cuisine === option}
                onClick={() => onChange({ cuisine: draft.cuisine === option ? "" : option })}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-xs font-medium text-neutral-500"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Tell customers what makes your business worth ordering from."
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full resize-none rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canContinue}
        className="mt-6 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>
    </form>
  );
}
