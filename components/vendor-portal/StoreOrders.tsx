"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  useGetVendorOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useMarkOrderReadyMutation,
  useHandoverOrderMutation,
} from "@/features/vendor/vendorOrdersApi";
import type { VendorOrderTab } from "@/features/vendor/types";
import type { Order } from "@/features/orders/types";
import { ORDER_STATUS_META } from "@/features/orders/statusMeta";
import { normalizeApiError } from "@/lib/utils/apiError";

const TABS: { id: VendorOrderTab; label: string }[] = [
  { id: "new", label: "New" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const TAB_IDS = TABS.map((t) => t.id);
function isVendorOrderTab(value: string | null): value is VendorOrderTab {
  return !!value && (TAB_IDS as string[]).includes(value);
}

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const REJECTION_REASONS = ["Out of stock", "Store too busy", "Closing soon", "Other"];

function OrderCard({ order, restaurantId, tab }: { order: Order; restaurantId: string; tab: VendorOrderTab }) {
  const [accept, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [reject, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [markReady, { isLoading: isMarkingReady }] = useMarkOrderReadyMutation();
  const [handover, { isLoading: isHandingOver }] = useHandoverOrderMutation();

  const [prepTime, setPrepTime] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const meta = ORDER_STATUS_META[order.status];

  const runAction = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="vd-form-card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <p className="vd-form-card__title" style={{ marginBottom: 2 }}>Order #{order.id.slice(0, 8)}</p>
          <p className="vd-form-card__sub" style={{ marginBottom: 0 }}>{formatTime(order.createdAt)}</p>
        </div>
        <span className={`op-badge op-badge--${meta.tone}`}>{meta.label}</span>
      </div>

      <div style={{ margin: "12px 0" }}>
        {order.items.map((item, i) => (
          <div key={i} className="op-item-row">
            <p className="op-item-row__name">
              {item.quantity}× {item.name}
            </p>
            <span className="op-item-row__price">{formatNaira(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="op-item-row__price">{formatNaira(Number(order.totalAmount))}</span>

        {tab === "new" && !rejecting && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              min={0}
              className="vd-input"
              style={{ width: 150 }}
              placeholder="Prep time (mins, optional)"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <button
              type="button"
              className="vd-submit-btn"
              style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
              disabled={isAccepting}
              onClick={() =>
                runAction(() =>
                  accept({
                    id: order.id,
                    restaurantId,
                    estimatedPrepTime: prepTime ? Number(prepTime) : undefined,
                  }).unwrap(),
                )
              }
            >
              {isAccepting ? "Accepting…" : "Accept"}
            </button>
            <button
              type="button"
              className="vd-back-link"
              style={{ marginBottom: 0 }}
              onClick={() => setRejecting(true)}
            >
              Reject
            </button>
          </div>
        )}

        {tab === "preparing" && (
          <button
            type="button"
            className="vd-submit-btn"
            style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
            disabled={isMarkingReady}
            onClick={() => runAction(() => markReady({ id: order.id, restaurantId }).unwrap())}
          >
            {isMarkingReady ? "Updating…" : "Mark ready"}
          </button>
        )}

        {tab === "ready" && (
          <button
            type="button"
            className="vd-submit-btn"
            style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
            disabled={isHandingOver}
            onClick={() => runAction(() => handover({ id: order.id, restaurantId }).unwrap())}
          >
            {isHandingOver ? "Updating…" : "Hand over to rider"}
          </button>
        )}
      </div>

      {rejecting && (
        <div className="vd-inline-panel">
          <div className="vd-field">
            <label htmlFor={`reason-${order.id}`}>Reason</label>
            <select id={`reason-${order.id}`} className="vd-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REJECTION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="vd-field">
            <label htmlFor={`note-${order.id}`}>Note (optional)</label>
            <textarea
              id={`note-${order.id}`}
              className="vd-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="vd-submit-btn"
              style={{ marginTop: 0, width: "auto", padding: "10px 18px" }}
              disabled={isRejecting}
              onClick={() =>
                runAction(async () => {
                  await reject({ id: order.id, restaurantId, rejectionReason: reason, rejectionNote: note || undefined }).unwrap();
                  setRejecting(false);
                })
              }
            >
              {isRejecting ? "Rejecting…" : "Confirm reject"}
            </button>
            <button type="button" className="vd-back-link" style={{ marginBottom: 0 }} onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="vd-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

const EMPTY_MESSAGE: Record<VendorOrderTab, string> = {
  new: "No new orders right now.",
  preparing: "Nothing in the kitchen right now.",
  ready: "No orders waiting for pickup.",
  completed: "No completed orders yet.",
  cancelled: "No rejected or cancelled orders.",
};

/** Rendered inside VendorStoreShell, which already guarantees a signed-in vendor before mounting this. */
export function StoreOrders({ storeId }: { storeId: string }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [tab, setTab] = useState<VendorOrderTab>(isVendorOrderTab(initialTab) ? initialTab : "new");

  const { data: orders = [], isLoading, isError } = useGetVendorOrdersQuery({ restaurantId: storeId, tab });

  return (
    <>
      <header className="vd-header">
        <h1 className="vd-title">Orders</h1>
        <p className="vd-subtitle">Accept, prepare, and hand off orders as they come in.</p>
      </header>

      <div className="vd-pill-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`vd-pill-tab ${tab === t.id ? "vd-pill-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="vp-empty">Loading orders…</p>
      ) : isError ? (
        <div className="vp-empty">
          <p className="vp-empty-title">Couldn&apos;t load orders</p>
          <p className="vp-empty-sub">Please check your connection and try again.</p>
        </div>
      ) : orders.length === 0 ? (
        <p className="vp-empty">{EMPTY_MESSAGE[tab]}</p>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} restaurantId={storeId} tab={tab} />)
      )}
    </>
  );
}
