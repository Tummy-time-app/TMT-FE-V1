"use client";

import { MapPinIcon } from "@/components/icons";
import type { VendorOnboardingDraft } from "../VendorOnboardingFlow";

export function LocationContactStep({
  draft,
  onChange,
  onNext,
}: {
  draft: VendorOnboardingDraft;
  onChange: (patch: Partial<VendorOnboardingDraft>) => void;
  onNext: () => void;
}) {
  const canContinue = draft.address.trim() && draft.city.trim() && draft.phone.trim();

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <h1 className="text-2xl font-medium text-neutral-900">Where can customers find you?</h1>
      <p className="mt-1 text-sm text-neutral-500">Used for delivery, pickup, and your storefront listing.</p>

      <div className="mt-6 space-y-4">
        <label className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
          <MapPinIcon className="size-5 shrink-0 text-neutral-500" />
          <input
            type="text"
            autoComplete="address-line1"
            placeholder="Street address"
            value={draft.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
        </label>

        <input
          type="text"
          placeholder="Landmark (optional)"
          value={draft.landmark}
          onChange={(e) => onChange({ landmark: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            autoComplete="address-level2"
            placeholder="City"
            value={draft.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
          <input
            type="text"
            autoComplete="address-level1"
            placeholder="State"
            value={draft.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="storePhone" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Phone number
            </label>
            <input
              id="storePhone"
              type="tel"
              autoComplete="tel"
              placeholder="For order calls"
              value={draft.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="storeEmail" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Email (optional)
            </label>
            <input
              id="storeEmail"
              type="email"
              autoComplete="email"
              placeholder="Business email"
              value={draft.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
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
