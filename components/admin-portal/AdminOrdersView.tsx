"use client";

import { useState } from "react";
import { useListAllOrdersQuery, useOverrideOrderStatusMutation } from "@/features/admin/adminOrdersApi";
import { ORDER_STATUS_META } from "@/features/orders/statusMeta";
import type { OrderStatus } from "@/features/orders/types";
import { AdminTable, type AdminTableColumn } from "./AdminTable";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const STATUS_FILTERS: OrderStatus[] = ["pending", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"];
const OVERRIDE_TARGETS: OrderStatus[] = ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered", "cancelled"];
const LIMIT = 20;

type Row = { id: string; status: OrderStatus; totalAmount: string | number; paymentMethod?: string; createdAt?: string };

/** Rendered inside AdminPortalShell. */
export function AdminOrdersView() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading, isError } = useListAllOrdersQuery({ page, limit: LIMIT, status });
  const [overrideStatus, { isLoading: isOverriding }] = useOverrideOrderStatusMutation();

  const handleOverride = async (id: string, next: OrderStatus) => {
    setError(null);
    try {
      await overrideStatus({ id, status: next }).unwrap();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  const columns: AdminTableColumn<Row>[] = [
    { key: "id", label: "Order", render: (o) => `#${o.id.slice(0, 8)}` },
    {
      key: "status",
      label: "Status",
      render: (o) => <span className={`op-badge op-badge--${ORDER_STATUS_META[o.status].tone}`}>{ORDER_STATUS_META[o.status].label}</span>,
    },
    { key: "total", label: "Total", render: (o) => formatNaira(Number(o.totalAmount)) },
    { key: "payment", label: "Payment", render: (o) => o.paymentMethod ?? "—" },
    {
      key: "actions",
      label: "Override status",
      render: (o) => (
        <div className="ad-row-actions">
          <select
            className="rd-pin-input"
            style={{ letterSpacing: "normal", fontSize: "0.8rem", textAlign: "left", padding: "4px 8px", margin: 0, maxWidth: 160 }}
            disabled={isOverriding}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleOverride(o.id, e.target.value as OrderStatus);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Set status…
            </option>
            {OVERRIDE_TARGETS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Orders</h1>
        <p className="vd-subtitle">Monitor every order platform-wide. Overriding status bypasses the normal vendor/rider workflow — use with care.</p>
      </header>

      <div className="ad-status-filter">
        <button type="button" className={`ad-status-filter__chip ${!status ? "ad-status-filter__chip--active" : ""}`} onClick={() => { setStatus(undefined); setPage(1); }}>
          All
        </button>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            className={`ad-status-filter__chip ${status === s ? "ad-status-filter__chip--active" : ""}`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {ORDER_STATUS_META[s].label}
          </button>
        ))}
      </div>

      {error && <p className="op-error">{error}</p>}

      <AdminTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No orders match this filter."
        pagination={data ? { page: data.pagination.page, totalPages: data.pagination.totalPages, onPageChange: setPage } : undefined}
      />
    </>
  );
}
