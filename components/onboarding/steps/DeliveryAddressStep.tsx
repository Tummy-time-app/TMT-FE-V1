"use client";

import { MapPinIcon } from "@/components/icons";
import type {
  DeliveryAddress,
  OnboardingDraft,
} from "@/lib/ProfileContext";

const labels: DeliveryAddress["label"][] = ["Home", "Work", "Other"];

export function DeliveryAddressStep({
  draft,
  onChange,
  onNext,
}: {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onNext: () => void;
}) {
  const canContinue =
    draft.address.line1.trim() &&
    draft.address.city.trim() &&
    draft.phone.trim();

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <h1 className="text-2xl font-medium text-neutral-900">
        Where should we deliver?
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        You can add more addresses later.
      </p>

      <div className="mt-6 space-y-4">
        <div className="flex gap-2">
          {labels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ address: { ...draft.address, label } })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                draft.address.label === label
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
          <MapPinIcon className="size-5 shrink-0 text-neutral-500" />
          <input
            type="text"
            autoComplete="address-line1"
            placeholder="Street address"
            value={draft.address.line1}
            onChange={(e) =>
              onChange({ address: { ...draft.address, line1: e.target.value } })
            }
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
        </label>

        <input
          type="text"
          autoComplete="address-level2"
          placeholder="City"
          value={draft.address.city}
          onChange={(e) =>
            onChange({ address: { ...draft.address, city: e.target.value } })
          }
          className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
        />

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-xs font-medium text-neutral-500"
          >
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="For your rider to reach you"
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
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
