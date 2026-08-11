"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/maps/types";

export type GeolocationWatchStatus = "idle" | "watching" | "denied" | "unsupported" | "error";

interface GeolocationWatchResult {
  position: LatLng | null;
  status: GeolocationWatchStatus;
  errorMessage: string | null;
}

/**
 * Real browser GPS via `navigator.geolocation.watchPosition` — spec §21/§22
 * want actual rider GPS streaming. Only watches while `enabled` is true (the
 * rider's availability toggle), and cleans up the watch on unmount/disable.
 * Untestable headlessly (no location hardware/permission in this sandbox),
 * but the API surface is standard and this is the real implementation, not
 * a stand-in — the mock layer only kicks in downstream, at the point the
 * position gets reported to the order (see updateRiderLocation).
 */
export function useGeolocationWatch(enabled: boolean): GeolocationWatchResult {
  const [liveStatus, setLiveStatus] = useState<"watching" | "denied" | "error" | null>(null);
  const [position, setPosition] = useState<LatLng | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSupported = typeof navigator !== "undefined" && !!navigator.geolocation;

  useEffect(() => {
    if (!enabled || !isSupported) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveStatus("watching");
        setErrorMessage(null);
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLiveStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setErrorMessage(err.message || "Couldn't get your location.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled, isSupported]);

  const status: GeolocationWatchStatus = !enabled ? "idle" : !isSupported ? "unsupported" : (liveStatus ?? "idle");

  return {
    position: enabled ? position : null,
    status,
    errorMessage: enabled ? errorMessage : null,
  };
}
