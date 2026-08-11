"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageSearch } from "@/components/icons";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useGetOrdersQuery } from "@/features/orders/ordersApi";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function OrdersContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery(user?.id ?? "", { skip: !user });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-text">Your orders</h1>
      <p className="mt-1 text-small text-text-muted">Track current orders and revisit past ones.</p>

      <div className="mt-8 space-y-4">
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
            action={{ label: "Browse restaurants", onClick: () => router.push("/") }}
          />
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-border bg-surface p-5 shadow-sm transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold text-text">{order.vendorName}</p>
                  <p className="mt-0.5 text-caption text-text-subtle">
                    {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-small text-text-muted">Order #{order.id}</span>
                <span className="font-display font-semibold text-text">{formatNaira(order.total)}</span>
              </div>
            </Link>
          ))
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
