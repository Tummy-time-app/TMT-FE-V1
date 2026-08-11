"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LifeBuoy, Plus } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/features/auth/hooks";
import { useCreateTicketMutation, useGetTicketsQuery } from "@/features/support/supportApi";
import { createTicketSchema, type CreateTicketFormValues } from "@/features/support/schemas";
import { TicketPriorityBadge, TicketStatusBadge } from "@/features/support/components/TicketBadges";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function SupportContent() {
  const { user } = useAuth();
  const { data: tickets, isLoading, error, refetch } = useGetTicketsQuery(user?.id ?? "", { skip: !user });
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({ resolver: zodResolver(createTicketSchema), defaultValues: { priority: "medium" } });

  const onSubmit = async (values: CreateTicketFormValues) => {
    if (!user) return;
    setSubmitError("");
    try {
      await createTicket({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        subject: values.subject,
        priority: values.priority,
        message: values.message,
      }).unwrap();
      toast.success("Ticket submitted — we'll get back to you soon.");
      reset({ priority: "medium", subject: "", message: "" });
      setShowForm(false);
    } catch (err) {
      setSubmitError(normalizeApiError(err as never).message);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-h1 font-bold text-text">Support</h1>
          <p className="mt-1 text-small text-text-muted">Need help? Open a ticket and we&apos;ll respond as soon as we can.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Plus size={16} aria-hidden />
          New ticket
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4 rounded-lg border border-border bg-surface p-5">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-small font-semibold text-text">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              placeholder="My order arrived incomplete"
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
              {...register("subject")}
            />
            {errors.subject && <p className="mt-1.5 text-caption font-semibold text-error">{errors.subject.message}</p>}
          </div>

          <div className="sm:w-1/3">
            <label htmlFor="priority" className="mb-1.5 block text-small font-semibold text-text">
              Priority
            </label>
            <select
              id="priority"
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
              {...register("priority")}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block text-small font-semibold text-text">
              Describe the issue
            </label>
            <textarea
              id="message"
              rows={4}
              placeholder="Tell us what happened…"
              className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
              {...register("message")}
            />
            {errors.message && <p className="mt-1.5 text-caption font-semibold text-error">{errors.message.message}</p>}
          </div>

          {submitError && <p className="text-small font-semibold text-error">{submitError}</p>}

          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreating ? "Submitting…" : "Submit ticket"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-black/5" />)
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets yet" description="Open a ticket if you need help with anything." />
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block rounded-lg border border-border bg-surface p-4 transition-shadow duration-fast hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-small font-semibold text-text">{ticket.subject}</p>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <TicketPriorityBadge priority={ticket.priority} />
                <span className="text-caption text-text-subtle">Updated {formatDate(ticket.updatedAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

export default function SupportPage() {
  return (
    <RequireAuth>
      <SupportContent />
    </RequireAuth>
  );
}
