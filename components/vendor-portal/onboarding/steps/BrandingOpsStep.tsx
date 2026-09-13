"use client";

import { CameraIcon } from "@/components/icons";
import type { VendorOnboardingDraft } from "../VendorOnboardingFlow";

export function BrandingOpsStep({
  draft,
  onChange,
  isSubmitting,
  error,
  onFinish,
  onSkip,
}: {
  draft: VendorOnboardingDraft;
  onChange: (patch: Partial<VendorOnboardingDraft>) => void;
  isSubmitting: boolean;
  error: string | null;
  onFinish: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-medium text-neutral-900">Finishing touches</h1>
      <p className="mt-1 text-sm text-neutral-500">Optional — you can always add or change these later in Settings.</p>

      <div className="mt-6 flex justify-center">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200">
          {draft.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary vendor-supplied URL, not a local/served asset
            <img
              src={draft.logoUrl}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <CameraIcon className="size-6" />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="logoUrl" className="mb-1.5 block text-xs font-medium text-neutral-500">
            Logo image URL
          </label>
          <input
            id="logoUrl"
            type="url"
            placeholder="https://…"
            value={draft.logoUrl}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="coverImageUrl" className="mb-1.5 block text-xs font-medium text-neutral-500">
            Cover image URL
          </label>
          <input
            id="coverImageUrl"
            type="url"
            placeholder="https://…"
            value={draft.coverImageUrl}
            onChange={(e) => onChange({ coverImageUrl: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="prepTime" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Avg. prep time (mins)
            </label>
            <input
              id="prepTime"
              type="number"
              min={0}
              placeholder="20"
              value={draft.averagePrepTime}
              onChange={(e) => onChange({ averagePrepTime: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="minOrder" className="mb-1.5 block text-xs font-medium text-neutral-500">
              Minimum order (₦)
            </label>
            <input
              id="minOrder"
              type="number"
              min={0}
              placeholder="1000"
              value={draft.minimumOrder}
              onChange={(e) => onChange({ minimumOrder: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="riderNotes" className="mb-1.5 block text-xs font-medium text-neutral-500">
            Notes for riders (optional)
          </label>
          <input
            id="riderNotes"
            type="text"
            placeholder="e.g. Gate code, entrance to use"
            value={draft.additionalDirections}
            onChange={(e) => onChange({ additionalDirections: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={onFinish}
        disabled={isSubmitting}
        className="mt-8 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Setting up your store…" : "Finish"}
      </button>
      <button
        type="button"
        onClick={onSkip}
        disabled={isSubmitting}
        className="mt-3 w-full text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Skip for now
      </button>
    </div>
  );
}
