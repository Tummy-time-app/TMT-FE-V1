"use client";

import { useState } from "react";
import { useListVendorsQuery, useUpdateVendorApprovalMutation, useDeleteVendorMutation } from "@/features/admin/adminVendorsApi";
import type { Restaurant } from "@/features/restaurants/types";
import { AdminTable, type AdminTableColumn } from "./AdminTable";
import { normalizeApiError } from "@/lib/utils/apiError";

const LIMIT = 20;

/** Rendered inside AdminPortalShell. */
export function AdminVendorsView() {
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading, isError } = useListVendorsQuery({ page, limit: LIMIT });
  const [updateApproval, { isLoading: isUpdating }] = useUpdateVendorApprovalMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

  const handleApproval = async (id: string, verificationStatus: NonNullable<Restaurant["verificationStatus"]>) => {
    setError(null);
    try {
      await updateApproval({ id, verificationStatus }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove "${name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteVendor({ id }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const columns: AdminTableColumn<Restaurant>[] = [
    { key: "name", label: "Vendor", render: (r) => r.name },
    { key: "cuisine", label: "Category", render: (r) => r.cuisine ?? "—" },
    {
      key: "status",
      label: "Verification",
      render: (r) => (
        <span className={`op-badge op-badge--${r.verificationStatus === "VERIFIED" ? "success" : r.verificationStatus === "REJECTED" ? "stopped" : "pending"}`}>
          {(r.verificationStatus ?? "PENDING").toLowerCase()}
        </span>
      ),
    },
    { key: "isOpen", label: "Open", render: (r) => (r.isOpen ? "Yes" : "No") },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="ad-row-actions">
          <button className="rd-btn rd-btn--primary" disabled={isUpdating} onClick={() => handleApproval(r.id, "VERIFIED")}>
            Approve
          </button>
          <button className="rd-btn rd-btn--ghost" disabled={isUpdating} onClick={() => handleApproval(r.id, "REJECTED")}>
            Reject
          </button>
          <button className="rd-btn rd-btn--ghost" disabled={isDeleting} onClick={() => handleDelete(r.id, r.name)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Vendors</h1>
        <p className="vd-subtitle">Approve, reject, or remove restaurants and stores.</p>
      </header>

      {error && <p className="op-error">{error}</p>}

      <AdminTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No vendors yet."
        pagination={data ? { page: data.pagination.page, totalPages: data.pagination.totalPages, onPageChange: setPage } : undefined}
      />
    </>
  );
}
