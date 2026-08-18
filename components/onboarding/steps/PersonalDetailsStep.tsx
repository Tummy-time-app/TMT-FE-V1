"use client";

import { useRef, type ChangeEvent } from "react";
import { CameraIcon } from "@/components/icons";
import type { OnboardingDraft } from "@/lib/ProfileContext";

export function PersonalDetailsStep({
  draft,
  onChange,
  onNext,
}: {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
  onNext: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ avatarDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const canContinue = draft.firstName.trim() && draft.lastName.trim();

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onNext();
      }}
    >
      <h1 className="text-2xl font-medium text-neutral-900">
        Tell us about you
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        This is how you&apos;ll appear to riders and restaurants.
      </p>

      <div className="mt-6 flex justify-center">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200"
            aria-label="Upload profile photo"
          >
            {draft.avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data-URL preview, not a served asset
              <img
                src={draft.avatarDataUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold">
                {draft.firstName.trim().charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-white transition-colors hover:bg-neutral-800"
          >
            <CameraIcon className="size-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="sr-only">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              value={draft.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="sr-only">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              value={draft.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-1.5 block text-xs font-medium text-neutral-500"
          >
            Date of birth (optional)
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={draft.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
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
