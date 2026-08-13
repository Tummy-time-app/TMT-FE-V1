"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PackageSearch, Bike } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { formatCartQty } from "@/lib/utils/quantity";
import { cn } from "@/lib/utils/cn";
import type { Order, OrderStatus } from "@/features/orders/types";

const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "picked_up", "cancelled"];
const isActive = (o: Order) => !TERMINAL_STATUSES.includes(o.status);

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function OrderCard({ order }: { order: Order }) {
  const active = isActive(order);
  const previewItems = order.items.slice(0, 3);
  const extraCount = order.items.length - previewItems.length;

  return (
    <Link
      href={`/orders/${order.id}`}
      className={cn(
        "block rounded-lg border bg-surface p-5 transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-md",
        active ? "border-primary/25 shadow-sm" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-text">{order.vendorName}</p>
          <p className="mt-0.5 text-caption text-text-subtle">
            {formatDate(order.createdAt)} · Order #{order.id}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* item thumbnails */}
      <div className="mt-3 flex items-center gap-2">
        {previewItems.map((item) => (
          <div key={item.id} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
        ))}
        {extraCount > 0 && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-caption font-semibold text-text-muted">
            +{extraCount}
          </span>
        )}
        <p className="min-w-0 truncate text-caption text-text-muted">
          {order.items.map((i) => `${formatCartQty(i)} ${i.name}`).join(", ")}
        </p>
      </div>

      {active && order.rider && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-caption font-semibold text-primary">
          <Bike size={14} aria-hidden />
          {order.rider.name} is on the way
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-small text-text-muted">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
        <span className="font-display font-bold text-text">{formatNaira(order.total)}</span>
      </div>
    </Link>
  );
}

function OrdersContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery(user?.id ?? "", { skip: !user });
  const [tab, setTab] = useState<"active" | "past">("active");

  const { active, past } = useMemo(() => {
    const list = orders ?? [];
    return { active: list.filter(isActive), past: list.filter((o) => !isActive(o)) };
  }, [orders]);

  const visible = tab === "active" ? active : past;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Your orders</h1>
      <p className="mt-1 text-small text-text-muted">Track current orders and revisit past ones.</p>

      {!isLoading && !error && orders && orders.length > 0 && (
        <div className="mt-6 inline-flex rounded-full border border-border bg-surface p-1">
          {(["active", "past"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-small font-semibold capitalize transition-colors",
                tab === t ? "bg-primary text-white" : "text-text-muted hover:text-text"
              )}
            >
              {t} {t === "active" ? `(${active.length})` : `(${past.length})`}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-black/5" />
          ))
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No orders yet"
            description="When you place an order, it'll show up here."
            action={{ label: "Start browsing", onClick: () => router.push("/") }}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={tab === "active" ? "No active orders" : "No past orders"}
            description={tab === "active" ? "Nothing in progress right now." : "Orders you've completed will show up here."}
          />
        ) : (
          visible.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
