"use client";

import Link from "next/link";
import { LifeBuoy } from "@/components/icons";
import { useGetAllTicketsQuery } from "@/features/support/supportApi";
import { TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/TicketBadges";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function AdminSupportPage() {
  const { data: tickets, isLoading, error, refetch } = useGetAllTicketsQuery();

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Support tickets</h1>
      <p className="mt-1 text-small text-text-muted">Every ticket raised across customers, vendors, and riders.</p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets" description="Support tickets will show up here." />
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-small font-semibold text-text">{ticket.subject}</p>
                  <p className="text-caption text-text-subtle">
                    {ticket.userName} ({ticket.userRole}) · Updated {formatDate(ticket.updatedAt)}
                  </p>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <div className="mt-2">
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
