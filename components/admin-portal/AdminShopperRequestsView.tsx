"use client";

import { useState } from "react";
import { useListShopperRequestsQuery, useUpdateShopperRequestStatusMutation } from "@/features/admin/adminShopperRequestsApi";
import type { ShopperRequest } from "@/features/personalShopper/types";
import { AdminTable, type AdminTableColumn } from "./AdminTable";
import { normalizeApiError } from "@/lib/utils/apiError";

const LIMIT = 20;

const STATUS_TONE: Record<ShopperRequest["status"], string> = {
  submitted: "pending",
  assigned: "active",
  shopping: "active",
  completed: "success",
  cancelled: "stopped",
};

function formatBudget(budget: ShopperRequest["budget"]) {
  if (budget == null || budget === "") return "No budget set";
  return `₦${Number(budget).toLocaleString()}`;
}

/**
 * Closes the same kind of gap the Riders admin page closed for rider
 * verification — Personal Shopper requests had a real create/list backend
 * (services/order-service/src/routes/shopperRequests.ts) but no admin UI to
 * ever advance a request past "submitted". `assignedShopperName` is free
 * text, not a real account — no shopper workforce/app exists.
 */
export function AdminShopperRequestsView() {
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [shopperNameDrafts, setShopperNameDrafts] = useState<Record<string, string>>({});
  const { data, isLoading, isError } = useListShopperRequestsQuery({ page, limit: LIMIT });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateShopperRequestStatusMutation();

  const handleUpdate = async (id: string, status: ShopperRequest["status"], assignedShopperName?: string) => {
    setError(null);
    try {
      await updateStatus({ id, status, assignedShopperName }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const columns: AdminTableColumn<ShopperRequest>[] = [
    {
      key: "item",
      label: "Item",
      render: (r) => (
        <div>
          <p style={{ fontWeight: 600 }}>
            {r.quantity}× {r.itemName}
          </p>
          {r.preferredBrand && <p className="vd-subtitle">Brand: {r.preferredBrand}</p>}
          {r.preferredStore && <p className="vd-subtitle">Store: {r.preferredStore}</p>}
        </div>
      ),
    },
    { key: "budget", label: "Budget", render: (r) => formatBudget(r.budget) },
    { key: "address", label: "Delivery to", render: (r) => r.deliveryAddress },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <div>
          <span className={`op-badge op-badge--${STATUS_TONE[r.status]}`}>{r.status}</span>
          {r.assignedShopperName && <p className="vd-subtitle">Shopper: {r.assignedShopperName}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => {
        if (r.status === "submitted") {
          const draft = shopperNameDrafts[r.id] ?? "";
          return (
            <div className="ad-row-actions">
              <input
                type="text"
                placeholder="Shopper name"
                value={draft}
                onChange={(e) => setShopperNameDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                className="vp-search-input"
                style={{ width: 140 }}
              />
              <button
                className="rd-btn rd-btn--primary"
                disabled={isUpdating || !draft.trim()}
                onClick={() => handleUpdate(r.id, "assigned", draft.trim())}
              >
                Assign
              </button>
              <button className="rd-btn rd-btn--ghost" disabled={isUpdating} onClick={() => handleUpdate(r.id, "cancelled")}>
                Cancel
              </button>
            </div>
          );
        }
        if (r.status === "assigned") {
          return (
            <div className="ad-row-actions">
              <button className="rd-btn rd-btn--primary" disabled={isUpdating} onClick={() => handleUpdate(r.id, "shopping")}>
                Start shopping
              </button>
              <button className="rd-btn rd-btn--ghost" disabled={isUpdating} onClick={() => handleUpdate(r.id, "cancelled")}>
                Cancel
              </button>
            </div>
          );
        }
        if (r.status === "shopping") {
          return (
            <button className="rd-btn rd-btn--primary" disabled={isUpdating} onClick={() => handleUpdate(r.id, "completed")}>
              Mark completed
            </button>
          );
        }
        return <span className="vd-subtitle">No action needed</span>;
      },
    },
  ];

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Shopper Requests</h1>
        <p className="vd-subtitle">Assign and track Personal Shopper requests.</p>
      </header>

      {error && <p className="op-error">{error}</p>}

      <AdminTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No shopper requests yet."
        pagination={data ? { page: data.pagination.page, totalPages: data.pagination.totalPages, onPageChange: setPage } : undefined}
      />
    </>
  );
}
