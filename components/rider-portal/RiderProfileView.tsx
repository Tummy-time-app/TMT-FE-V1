"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useGetRiderProfileQuery, useUpdateRiderProfileMutation } from "@/features/rider/riderProfileApi";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { VehicleType } from "@/features/rider/types";

const VEHICLE_TYPES: VehicleType[] = ["bicycle", "motorcycle", "car", "van"];

/**
 * Rendered inside RiderPortalShell — a verified, signed-in rider is
 * guaranteed. Logging out is handled by RiderTopBar (always visible in this
 * shell), so it's not duplicated here.
 */
export function RiderProfileView() {
  const { user } = useAuth();
  const { data: profile } = useGetRiderProfileQuery(user?.id ?? "", { skip: !user });
  const [updateProfile, { isLoading }] = useUpdateRiderProfileMutation();

  const [vehicleType, setVehicleType] = useState<VehicleType>("motorcycle");
  const [plateNumber, setPlateNumber] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setVehicleType(profile.vehicleType);
      setPlateNumber(profile.plateNumber ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ userId: user.id, vehicleType, plateNumber }).unwrap();
      setSaved(true);
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Profile</h1>
        <p className="vd-subtitle">Your rider details and vehicle information.</p>
      </header>

      <div className="vd-section">
        <h2 className="vd-section-title">Account</h2>
        <div className="rd-delivery-card">
          <p className="rd-delivery-card__label">Name</p>
          <p className="rd-delivery-card__value">{user?.name}</p>
          <p className="rd-delivery-card__label" style={{ marginTop: 10 }}>Email</p>
          <p className="rd-delivery-card__value">{user?.email}</p>
          <p className="rd-delivery-card__label" style={{ marginTop: 10 }}>Verification status</p>
          <span className={`op-badge op-badge--${profile?.verificationStatus === "verified" ? "success" : "pending"}`}>
            {profile?.verificationStatus}
          </span>
        </div>
      </div>

      <div className="vd-section">
        <h2 className="vd-section-title">Vehicle</h2>
        <div className="rd-delivery-card">
          <p className="rd-delivery-card__label">Vehicle type</p>
          <select
            className="rd-pin-input"
            style={{ letterSpacing: "normal", fontSize: "0.9rem", textAlign: "left", maxWidth: 240 }}
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as VehicleType)}
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v[0].toUpperCase() + v.slice(1)}
              </option>
            ))}
          </select>

          <p className="rd-delivery-card__label" style={{ marginTop: 14 }}>Plate number</p>
          <input
            className="rd-pin-input"
            style={{ letterSpacing: "normal", fontSize: "0.9rem", textAlign: "left", maxWidth: 240 }}
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="e.g. LAG-123-XY"
          />

          {error && <p className="op-error">{error}</p>}
          {saved && <p className="vd-subtitle" style={{ color: "#1a8a4a" }}>Saved.</p>}

          <button className="rd-btn rd-btn--primary" style={{ marginTop: 12 }} onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}
