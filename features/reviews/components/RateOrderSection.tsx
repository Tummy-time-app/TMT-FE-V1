"use client";

import { useState } from "react";
import { StarSolid } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useCreateReviewMutation, useGetOrderReviewsQuery } from "@/features/reviews/reviewsApi";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/features/orders/types";
import type { Review, ReviewTargetType } from "@/features/reviews/types";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          className={cn("transition-colors", n <= (hover || value) ? "text-secondary" : "text-black/15")}
        >
          <StarSolid size={22} aria-hidden />
        </button>
      ))}
    </div>
  );
}

function OneReviewForm({
  orderId,
  targetType,
  targetId,
  label,
  onDone,
}: {
  orderId: string;
  targetType: ReviewTargetType;
  targetId: string;
  label: string;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const toast = useToast();

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    try {
      await createReview({
        orderId,
        reviewerId: user.id,
        reviewerName: user.name,
        targetType,
        targetId,
        rating,
        comment: comment.trim(),
      }).unwrap();
      toast.success("Thanks for the feedback!");
      onDone();
    } catch (err) {
      toast.error(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-small font-semibold text-text">{label}</p>
      <div className="mt-2">
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment (optional)"
        rows={2}
        className="mt-3 w-full resize-none rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating === 0 || isLoading}
        className="mt-3 rounded-md bg-primary px-4 py-2 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Submitting…" : "Submit rating"}
      </button>
    </div>
  );
}

function SubmittedReview({ review, label }: { review: Review; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-small font-semibold text-text">{label}</p>
        <span className="flex items-center gap-1 text-small font-semibold text-secondary">
          <StarSolid size={14} aria-hidden />
          {review.rating}/5
        </span>
      </div>
      {review.comment && <p className="mt-1.5 text-small text-text-muted">&ldquo;{review.comment}&rdquo;</p>}
      {review.vendorResponse && (
        <div className="mt-2 rounded-md bg-black/[0.03] p-2.5 text-caption text-text-muted">
          <span className="font-semibold text-text">Vendor reply: </span>
          {review.vendorResponse}
        </div>
      )}
    </div>
  );
}

/** Delivered-order rating prompt — vendor always, rider too when one was assigned. Renders nothing until the order is actually delivered. */
export function RateOrderSection({ order }: { order: Order }) {
  const { data: reviews, refetch } = useGetOrderReviewsQuery(order.id, { skip: order.status !== "delivered" });

  if (order.status !== "delivered") return null;

  const vendorReview = reviews?.find((r) => r.targetType === "vendor");
  const riderReview = reviews?.find((r) => r.targetType === "rider");

  return (
    <section className="mt-5 space-y-3">
      <h2 className="font-display text-small font-bold text-text">Rate this order</h2>

      {vendorReview ? (
        <SubmittedReview review={vendorReview} label={`Your rating of ${order.vendorName}`} />
      ) : (
        <OneReviewForm
          orderId={order.id}
          targetType="vendor"
          targetId={order.vendorId}
          label={`How was the food from ${order.vendorName}?`}
          onDone={refetch}
        />
      )}

      {order.rider &&
        (riderReview ? (
          <SubmittedReview review={riderReview} label={`Your rating of ${order.rider.name}`} />
        ) : (
          <OneReviewForm
            orderId={order.id}
            targetType="rider"
            targetId={order.rider.id}
            label={`How was your delivery from ${order.rider.name}?`}
            onDone={refetch}
          />
        ))}
    </section>
  );
}
