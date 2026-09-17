"use client";

import { useState } from "react";
import { useListRidersQuery, useVerifyRiderMutation } from "@/features/admin/adminRidersApi";
import type { AdminRider } from "@/features/admin/types";
import { AdminTable, type AdminTableColumn } from "./AdminTable";
import { normalizeApiError } from "@/lib/utils/apiError";

const LIMIT = 20;

/**
 * Rendered inside AdminPortalShell. This is the page that actually closes
 * the rider-verification gap flagged during the rider-app build — until
 * now, `PATCH /admin/riders/:id/verify` existed only as a curl-reachable
 * stand-in with no frontend calling it.
 */
export function AdminRidersView() {
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading, isError } = useListRidersQuery({ page, limit: LIMIT });
  const [verifyRider, { isLoading: isVerifying }] = useVerifyRiderMutation();

  const handleVerify = async (rider: AdminRider, status: "verified" | "rejected") => {
    setError(null);
    try {
      await verifyRider({ id: rider.id, userId: rider.userId, status }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const columns: AdminTableColumn<AdminRider>[] = [
    { key: "name", label: "Rider", render: (r) => r.name },
    { key: "email", label: "Email", render: (r) => r.email },
    { key: "vehicle", label: "Vehicle", render: (r) => `${r.vehicleType}${r.plateNumber ? ` · ${r.plateNumber}` : ""}` },
    {
      key: "status",
      label: "Verification",
      render: (r) => (
        <span className={`op-badge op-badge--${r.verificationStatus === "verified" ? "success" : r.verificationStatus === "rejected" ? "stopped" : "pending"}`}>
          {r.verificationStatus}
        </span>
      ),
    },
    { key: "online", label: "Online", render: (r) => (r.isOnline ? "Yes" : "No") },
    {
      key: "actions",
      label: "Actions",
      render: (r) =>
        r.verificationStatus === "pending" ? (
          <div className="ad-row-actions">
            <button className="rd-btn rd-btn--primary" disabled={isVerifying} onClick={() => handleVerify(r, "verified")}>
              Verify
            </button>
            <button className="rd-btn rd-btn--ghost" disabled={isVerifying} onClick={() => handleVerify(r, "rejected")}>
              Reject
            </button>
          </div>
        ) : (
          <span className="vd-subtitle">No action needed</span>
        ),
    },
  ];

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Riders</h1>
        <p className="vd-subtitle">Review and approve rider applications.</p>
      </header>

      {error && <p className="op-error">{error}</p>}

      <AdminTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No riders yet."
        pagination={data ? { page: data.pagination.page, totalPages: data.pagination.totalPages, onPageChange: setPage } : undefined}
      />
    </>
  );
}
