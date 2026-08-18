"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { CameraIcon, LogOutIcon, MapPinIcon, PencilIcon } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { Chip } from "@/components/ui/Chip";
import { cuisineOptions, dietaryOptions } from "@/lib/foodPreferences";
import {
  useProfile,
  type DeliveryAddress,
  type UserProfile,
} from "@/lib/ProfileContext";
import { toggleValue } from "@/lib/utils/array";

const addressLabels: DeliveryAddress["label"][] = ["Home", "Work", "Other"];

const fieldClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-2xl font-medium text-neutral-900">
        Set up your profile
      </h1>
      <p className="mt-2 max-w-xs text-sm text-neutral-500">
        Finish onboarding to save your details here — name, delivery address,
        and food preferences.
      </p>
      <Link
        href="/onboarding"
        className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Complete your profile
      </Link>
    </div>
  );
}

function LoggedOutState() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-2xl font-medium text-neutral-900">
        Log in to view your profile
      </h1>
      <p className="mt-2 max-w-xs text-sm text-neutral-500">
        Your profile is tied to your TummyTime account.
      </p>
      <Link
        href="/login?redirect=/profile"
        className="mt-6 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Log in
      </Link>
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isSessionLoading } = useAuth();
  const { profile, isHydrated, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the draft in sync with the saved profile whenever we're not
  // actively editing (e.g. after the localStorage hydration read lands).
  useEffect(() => {
    if (!isEditing) setDraft(profile);
  }, [profile, isEditing]);

  if (!isHydrated || isSessionLoading) {
    return (
      <p className="py-20 text-center text-sm text-neutral-400">
        Loading your profile…
      </p>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoggedOutState />;
  }

  if (!profile.onboardingCompleted) {
    return <EmptyState />;
  }

  const patch = (update: Partial<UserProfile>) =>
    setDraft((prev) => ({ ...prev, ...update }));

  const startEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };
  const saveEdit = () => {
    updateProfile(draft);
    setIsEditing(false);
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ avatarDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  // Preference chips save immediately — no separate edit mode needed for a
  // toggle interaction, unlike the structured name/address fields below.
  const togglePreference = (
    key: "dietaryPreferences" | "favoriteCuisines",
    value: string,
  ) => {
    if (key === "dietaryPreferences") {
      updateProfile({
        dietaryPreferences: toggleValue(profile.dietaryPreferences, value),
      });
    } else {
      updateProfile({
        favoriteCuisines: toggleValue(profile.favoriteCuisines, value),
      });
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const avatar = isEditing ? draft.avatarDataUrl : profile.avatarDataUrl;

  return (
    <div>
      {/* header card */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- local data-URL preview, not a served asset
                <img src={avatar} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-xl font-semibold">
                  {profile.firstName.trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change profile photo"
                  className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-white transition-colors hover:bg-neutral-800"
                >
                  <CameraIcon className="size-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">
              {fullName || "Your name"}
            </h1>
            <p className="text-sm text-neutral-500">
              {profile.address.label}
              {profile.address.city ? ` · ${profile.address.city}` : ""}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            <PencilIcon className="size-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* personal information */}
      <section className="mt-10">
        <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Personal information
        </h2>
        <div className="mt-3 rounded-xl border border-neutral-200">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3 p-4">
              <input
                value={draft.firstName}
                onChange={(e) => patch({ firstName: e.target.value })}
                placeholder="First name"
                className={fieldClass}
              />
              <input
                value={draft.lastName}
                onChange={(e) => patch({ lastName: e.target.value })}
                placeholder="Last name"
                className={fieldClass}
              />
              <input
                type="date"
                value={draft.dateOfBirth}
                onChange={(e) => patch({ dateOfBirth: e.target.value })}
                className={`col-span-2 ${fieldClass}`}
              />
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="Phone number"
                className={`col-span-2 ${fieldClass}`}
              />
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              <Row label="Name" value={fullName || "—"} />
              <Row label="Email" value={user.email} />
              <Row label="Date of birth" value={profile.dateOfBirth || "—"} />
              <Row label="Phone" value={profile.phone || "—"} />
            </div>
          )}
        </div>
      </section>

      {/* delivery address */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Delivery address
        </h2>
        <div className="mt-3 rounded-xl border border-neutral-200 p-4">
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                {addressLabels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      patch({ address: { ...draft.address, label } })
                    }
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      draft.address.label === label
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2.5 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
                <MapPinIcon className="size-4 shrink-0 text-neutral-500" />
                <input
                  value={draft.address.line1}
                  onChange={(e) =>
                    patch({
                      address: { ...draft.address, line1: e.target.value },
                    })
                  }
                  placeholder="Street address"
                  className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
                />
              </label>
              <input
                value={draft.address.city}
                onChange={(e) =>
                  patch({ address: { ...draft.address, city: e.target.value } })
                }
                placeholder="City"
                className={fieldClass}
              />
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {profile.address.label}
                </p>
                <p className="text-sm text-neutral-600">
                  {profile.address.line1 || "No address saved"}
                  {profile.address.city ? `, ${profile.address.city}` : ""}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* food preferences — always directly editable, no edit-mode gate */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Food preferences
        </h2>
        <div className="mt-3 rounded-xl border border-neutral-200 p-4">
          <p className="text-xs font-medium text-neutral-500">Dietary</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={profile.dietaryPreferences.includes(option)}
                onClick={() => togglePreference("dietaryPreferences", option)}
              />
            ))}
          </div>

          <p className="mt-4 text-xs font-medium text-neutral-500">
            Cuisines
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {cuisineOptions.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={profile.favoriteCuisines.includes(option)}
                onClick={() => togglePreference("favoriteCuisines", option)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* account */}
      <section className="mt-8 border-t border-neutral-200 pt-6">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
        >
          <LogOutIcon className="size-4" />
          Log out
        </button>
      </section>
    </div>
  );
}
