"use client";

import { useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useAddTicketMessageMutation, useGetTicketQuery, useUpdateTicketStatusMutation } from "@/features/support/supportApi";
import { TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/TicketBadges";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { TicketStatus } from "@/features/support/types";

const STAFF_ROLES = ["admin", "super_admin", "support"];
const STATUS_OPTIONS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function TicketConversation({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const { data: ticket, isLoading, error, refetch } = useGetTicketQuery(ticketId);
  const [addMessage, { isLoading: isSending }] = useAddTicketMessageMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();
  const [message, setMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-6 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-black/5" />
      </div>
    );
  }

  if (error) {
    if (normalizeApiError(error).status === 404) notFound();
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!ticket || !user) return null;

  const isStaff = STAFF_ROLES.includes(user.role);

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await updateStatus({ id: ticket.id, status }).unwrap();
      toast.success(`Ticket marked as ${status.replace("_", " ")}.`);
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSendError("");
    try {
      await addMessage({
        ticketId: ticket.id,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: message.trim(),
        attachmentName: attachmentName ?? undefined,
      }).unwrap();
      setMessage("");
      setAttachmentName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setSendError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <Link
        href="/support"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden /> All tickets
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-caption text-text-subtle">Ticket #{ticket.id}</p>
          <h1 className="font-display text-h2 font-bold text-text">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2">
          <TicketPriorityBadge priority={ticket.priority} />
          {isStaff ? (
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-caption font-semibold text-text outline-none transition-colors focus:border-primary"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          ) : (
            <TicketStatusBadge status={ticket.status} />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-5">
        {ticket.messages.map((msg) => {
          const isMine = msg.senderId === user.id;
          return (
            <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2.5 text-small",
                  isMine ? "bg-primary text-white" : "bg-black/5 text-text"
                )}
              >
                {!isMine && <p className="mb-0.5 text-caption font-semibold opacity-70">{msg.senderName}</p>}
                <p className="whitespace-pre-wrap">{msg.message}</p>
                {msg.attachmentName && (
                  <p className={cn("mt-1.5 flex items-center gap-1 text-caption", isMine ? "text-white/80" : "text-text-muted")}>
                    <Paperclip size={11} aria-hidden />
                    {msg.attachmentName}
                  </p>
                )}
              </div>
              <p className="mt-1 text-caption text-text-subtle">{formatTime(msg.createdAt)}</p>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-4 rounded-lg border border-border bg-surface-elevated p-3 shadow-md">
        {attachmentName && (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-black/5 px-3 py-1.5 text-caption text-text-muted">
            <Paperclip size={12} aria-hidden />
            {attachmentName}
            <button type="button" onClick={() => setAttachmentName(null)} className="ml-auto font-semibold text-error">
              Remove
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setAttachmentName(e.target.files?.[0]?.name ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Paperclip size={16} aria-hidden />
          </button>
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <Send size={16} aria-hidden />
          </button>
        </div>
        {sendError && <p className="mt-2 text-caption font-semibold text-error">{sendError}</p>}
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  return (
    <RequireAuth>
      <TicketConversation ticketId={params.ticketId} />
    </RequireAuth>
  );
}
