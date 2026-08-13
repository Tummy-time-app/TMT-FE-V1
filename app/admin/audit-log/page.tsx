"use client";

import { useState } from "react";
import { Log } from "@/components/icons";
import { useGetAuditLogQuery } from "@/features/audit/auditApi";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/utils/cn";
import type { AuditLogEntry } from "@/features/audit/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const ACTION_TONE: Record<string, string> = {
  deactivated: "text-error",
  suspended: "text-error",
  hidden: "text-error",
  deleted: "text-error",
  approved: "text-success",
  activated: "text-success",
  restored: "text-success",
};

function toneForAction(action: string) {
  const suffix = action.split(".")[1] ?? "";
  return ACTION_TONE[suffix] ?? "text-text";
}

function EntryRow({ entry }: { entry: AuditLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = entry.before !== undefined || entry.after !== undefined;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-small text-text">
          <span className="font-semibold">{entry.actorName}</span>{" "}
          <span className="text-text-subtle">({entry.actorRole})</span>{" "}
          <span className={cn("font-semibold", toneForAction(entry.action))}>{entry.action}</span>
        </p>
        <span className="text-caption text-text-subtle">{formatDateTime(entry.createdAt)}</span>
      </div>
      <p className="mt-1 text-caption text-text-subtle">
        {entry.targetTable} · {entry.targetId}
      </p>

      {hasDetail && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-caption font-semibold text-primary hover:underline"
          >
            {expanded ? "Hide details" : "Show details"}
          </button>
          {expanded && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-black/[0.03] p-3 text-[0.7rem] text-text-muted">
              {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminAuditLogPage() {
  const { data: entries, isLoading, error, refetch } = useGetAuditLogQuery();

  return (
    <div>
      <h1 className="font-display text-h1 font-bold text-text">Audit log</h1>
      <p className="mt-1 text-small text-text-muted">
        Every admin action on the platform — vendor approvals, account changes, moderation, CMS edits.
      </p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !entries || entries.length === 0 ? (
          <EmptyState icon={Log} title="No admin actions yet" description="Actions like approving a vendor or hiding a review will show up here." />
        ) : (
          entries.map((entry) => <EntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
