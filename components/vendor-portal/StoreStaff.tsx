"use client";

import { useState } from "react";
import { useGetStaffQuery, useRemoveStaffMutation } from "@/features/vendor/staffApi";
import type { StaffMember } from "@/features/vendor/types";
import { normalizeApiError } from "@/lib/utils/apiError";

const ROLE_LABELS: Record<string, string> = {
  vendor_owner: "Owner",
  restaurant_owner: "Owner",
  vendor_manager: "Manager",
  vendor_kitchen: "Kitchen staff",
  vendor_accountant: "Accountant",
};

function roleLabel(role: string) {
  return ROLE_LABELS[role] ?? role;
}

function StaffRow({ member, restaurantId }: { member: StaffMember; restaurantId: string }) {
  const [removeStaff, { isLoading }] = useRemoveStaffMutation();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async () => {
    setError(null);
    try {
      await removeStaff({ id: member.id, restaurantId }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="vd-form-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <p className="vd-form-card__title" style={{ marginBottom: 2 }}>{member.name}</p>
          <p className="vd-form-card__sub" style={{ marginBottom: 0 }}>{member.email}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className="op-badge op-badge--active">{roleLabel(member.role)}</span>
          {!confirming && (
            <button type="button" className="vd-back-link" style={{ marginBottom: 0 }} onClick={() => setConfirming(true)}>
              Remove
            </button>
          )}
        </div>
      </div>

      {confirming && (
        <div className="vd-inline-panel">
          <p style={{ fontSize: "0.85rem", color: "var(--text-dark)", marginBottom: 10 }}>
            Remove {member.name} from this store&apos;s team?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="vd-submit-btn"
              style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
              disabled={isLoading}
              onClick={handleRemove}
            >
              {isLoading ? "Removing…" : "Confirm remove"}
            </button>
            <button type="button" className="vd-back-link" style={{ marginBottom: 0 }} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
          {error && <p className="vd-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreStaff({ storeId }: { storeId: string }) {
  const { data: staff = [], isLoading, isError } = useGetStaffQuery(storeId);

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Staff</h1>
        <p className="vd-subtitle">Your store&apos;s team.</p>
      </header>

      <div className="vd-form-card" style={{ marginBottom: 20, background: "rgba(172, 0, 0, 0.04)" }}>
        <p style={{ fontSize: "0.82rem", color: "#777", margin: 0 }}>
          Inviting new staff isn&apos;t available yet — check back once account lookup is supported.
        </p>
      </div>

      <div className="vd-section">
        {isLoading ? (
          <p className="vp-empty">Loading staff…</p>
        ) : isError ? (
          <div className="vp-empty">
            <p className="vp-empty-title">Couldn&apos;t load staff</p>
            <p className="vp-empty-sub">Please check your connection and try again.</p>
          </div>
        ) : staff.length === 0 ? (
          <p className="vp-empty">No staff added yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {staff.map((member) => (
              <StaffRow key={member.id} member={member} restaurantId={storeId} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
