"use client";

import { useState } from "react";
import { Map } from "./Map";
import { reverseGeocode } from "./reverseGeocode";
import type { LatLng } from "./types";

/** Lagos, Nigeria — matches the ₦ pricing used throughout the app; a reasonable default center before a real pick. */
const DEFAULT_CENTER: LatLng = { lat: 6.5244, lng: 3.3792 };

/**
 * Tap-to-place delivery location picker. Composes the generic `Map` with
 * a "use my location" button and reverse geocoding (fills the caller's
 * address text fields from the picked point — still editable by hand
 * after, same as every other field on this step).
 */
export function LocationPickerMap({
  value,
  onChange,
  onAddressResolved,
  className,
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  onAddressResolved?: (addr: { line1: string; city: string }) => void;
  className?: string;
}) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const applyPick = async (pos: LatLng) => {
    onChange(pos);
    const resolved = await reverseGeocode(pos.lat, pos.lng);
    if (resolved) onAddressResolved?.(resolved);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        void applyPick({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setLocateError("Couldn't get your location — tap the map to drop a pin instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className={className}>
      <div style={{ position: "relative" }}>
        <Map
          center={value ?? DEFAULT_CENTER}
          zoom={value ? 16 : 12}
          markers={value ? [{ id: "picked", kind: "customer", ...value }] : []}
          onPick={(pos) => void applyPick(pos)}
          scrollZoom
          height={220}
        />
        <button type="button" className="tmt-map-locate-btn" onClick={useMyLocation} disabled={locating}>
          📍 {locating ? "Locating…" : "Use my location"}
        </button>
      </div>
      <p className="tmt-map-hint">
        {locateError ??
          (value ? "Tap the map again to adjust the pin." : "Tap the map to drop a pin at your delivery spot.")}
      </p>
    </div>
  );
}
