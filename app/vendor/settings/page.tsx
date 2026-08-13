"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorDetailQuery, useSetVendorOperatingHoursMutation } from "@/features/vendors/vendorsApi";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { DayOfWeek, OperatingHours } from "@/features/vendors/types";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const DEFAULT_WINDOW = { open: "09:00", close: "21:00" };

/** Only mounted once `initialHours` is known (see the page component below) — no effect needed to sync fetched data into local state. */
function HoursEditor({ vendorId, initialHours }: { vendorId: string; initialHours: OperatingHours }) {
  const [hours, setHoursState] = useState<OperatingHours>(initialHours);
  const [setHours, { isLoading: isSaving }] = useSetVendorOperatingHoursMutation();
  const toast = useToast();

  const isDayOpen = (day: DayOfWeek) => !!hours[day]?.length;

  const toggleDay = (day: DayOfWeek) => {
    setHoursState((h) => {
      const next = { ...h };
      if (isDayOpen(day)) {
        delete next[day];
      } else {
        next[day] = [DEFAULT_WINDOW];
      }
      return next;
    });
  };

  const updateWindow = (day: DayOfWeek, field: "open" | "close", value: string) => {
    setHoursState((h) => ({
      ...h,
      [day]: [{ ...(h[day]?.[0] ?? DEFAULT_WINDOW), [field]: value }],
    }));
  };

  const handleSave = async () => {
    try {
      await setHours({ vendorId, hours }).unwrap();
      toast.success("Store hours updated.");
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div>
      <div className="space-y-2 rounded-lg border border-border bg-surface p-5">
        {DAYS.map(({ key, label }) => {
          const open = isDayOpen(key);
          const window = hours[key]?.[0] ?? DEFAULT_WINDOW;
          return (
            <div key={key} className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
              <label className="flex w-32 shrink-0 items-center gap-2 text-small font-semibold text-text">
                <input
                  type="checkbox"
                  checked={open}
                  onChange={() => toggleDay(key)}
                  className="h-4 w-4 accent-[var(--crimson)]"
                />
                {label}
              </label>
              {open ? (
                <div className="flex items-center gap-2 text-small text-text-muted">
                  <input
                    type="time"
                    value={window.open}
                    onChange={(e) => updateWindow(key, "open", e.target.value)}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-small text-text outline-none focus:border-primary"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={window.close}
                    onChange={(e) => updateWindow(key, "close", e.target.value)}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-small text-text outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <span className="text-small text-text-subtle">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving…" : "Save hours"}
      </button>
    </div>
  );
}

export default function VendorSettingsPage() {
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: vendorDetail, isLoading } = useGetVendorDetailQuery(vendorId, { skip: !vendorId });

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Store hours</h1>
      <p className="mt-1 text-small text-text-muted">Set when customers can order from you each day.</p>

      <div className="mt-6">
        {isLoading || !vendorDetail ? (
          <div className="h-64 animate-pulse rounded-lg bg-black/5" />
        ) : (
          <HoursEditor vendorId={vendorId} initialHours={vendorDetail.restaurant.operatingHours ?? {}} />
        )}
      </div>
    </div>
  );
}
