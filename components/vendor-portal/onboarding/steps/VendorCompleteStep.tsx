"use client";

import { CheckCircleIcon } from "@/components/icons";
import type { VendorRestaurant } from "@/features/vendor/types";

export function VendorCompleteStep({
  store,
  profileSaveFailed,
  onDone,
}: {
  store: VendorRestaurant;
  /** True when createStore succeeded but the follow-up updateStoreProfile
   *  patch (branding/ops fields) didn't — the store is real and usable,
   *  just missing those extra details until fixed in Settings. */
  profileSaveFailed: boolean;
  onDone: () => void;
}) {
  return (
    <div className="w-full text-center">
      <CheckCircleIcon className="mx-auto size-16 text-green-600" />

      <h1 className="mt-4 text-2xl font-medium text-neutral-900">{store.name} is on TummyTime!</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Your store is set up at {store.address}. It&apos;s pending verification, but you can start
        building your menu right away.
      </p>

      {profileSaveFailed && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Your store was created, but a few of the extra details didn&apos;t save. You can add them
          any time from Settings.
        </p>
      )}

      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full rounded-lg bg-neutral-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        Go to your dashboard
      </button>
    </div>
  );
}
