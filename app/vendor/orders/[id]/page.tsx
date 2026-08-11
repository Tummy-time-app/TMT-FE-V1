"use client";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@/components/icons";
import { useGetOrderQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { getVendorAction, canReject, waitingMessage } from "@/features/orders/vendorTransitions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { normalizeApiError } from "@/lib/utils/apiError";
import { useToast } from "@/components/feedback/ToastProvider";
import type { PaymentMethod, PaymentStatus } from "@/features/orders/types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash_on_delivery: "Pay on delivery",
  bank_transfer: "Bank transfer",
  wallet: "Wallet",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing…",
  paid: "Paid",
  failed: "Failed",
};

export default function VendorOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(params.id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [rejectOpen, setRejectOpen] = useState(false);
  const toast = useToast();

  if (isLoading) {
    return (
      <div>
        <div className="h-6 w-40 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-black/5" />
      </div>
    );
  }

  if (error) {
    if (normalizeApiError(error).status === 404) notFound();
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!order) return null;

  const action = getVendorAction(order.status);
  const canRejectOrder = canReject(order.status);
  const waiting = waitingMessage(order.status, order.orderType);

  const handleAdvance = async () => {
    if (!action) return;
    try {
      await updateStatus({ id: order.id, status: action.nextStatus }).unwrap();
      toast.success(`Order marked as "${action.nextStatus.replace(/_/g, " ")}".`);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleReject = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      setRejectOpen(false);
      toast.success("Order rejected.");
    } catch (err) {
      setRejectOpen(false);
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/vendor/orders"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption text-text-subtle">Order #{order.id}</p>
          <h1 className="font-display text-h2 font-bold text-text">{order.customerName}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <section className="mt-5 rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-small font-bold text-text">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-text">{item.name}</p>
                {item.note && <p className="text-caption text-text-muted">{item.note}</p>}
              </div>
              <span className="text-small text-text-muted">x{item.qty}</span>
              <span className="text-small font-semibold text-text">{formatNaira(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-small">
          <div className="flex justify-between text-text-muted">
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          {order.orderType === "delivery" && (
            <div className="flex justify-between text-text-muted">
              <span>Delivery fee</span>
              <span>{formatNaira(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-display font-bold text-text">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">
            {order.orderType === "delivery" ? "Delivery address" : "Pickup"}
          </h2>
          <p className="mt-2 text-small text-text-muted">
            {order.orderType === "delivery" ? order.deliveryAddress : "Customer will pick up in-store"}
          </p>
          {order.riderNote && <p className="mt-2 text-caption text-text-subtle">Note: {order.riderNote}</p>}
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-small font-bold text-text">Payment</h2>
          <p className="mt-2 text-small text-text-muted">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p>
          <p className="mt-1 text-caption text-text-subtle">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</p>
        </div>
      </section>

      {waiting && (
        <div className="mt-5 rounded-lg border border-info/30 bg-info-bg px-5 py-4 text-small font-semibold text-info">
          {waiting}
        </div>
      )}

      {(action || canRejectOrder) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {action && (
            <button
              type="button"
              onClick={handleAdvance}
              disabled={isUpdating}
              className="rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isUpdating ? "Updating…" : action.label}
            </button>
          )}
          {canRejectOrder && (
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="rounded-md border-2 border-error/30 px-5 py-2.5 text-small font-semibold text-error transition-colors duration-fast hover:bg-error-bg"
            >
              Reject order
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen}
        title="Reject this order?"
        description="The customer will be notified and refunded if payment was already made."
        confirmLabel="Reject order"
        cancelLabel="Keep order"
        destructive
        isConfirming={isCancelling}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
