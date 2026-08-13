/** Maps to the `reviews` table (doc §4 "Promotions, reviews, support"). */
export type ReviewTargetType = "vendor" | "rider";

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
  /** The vendor's reply — only meaningful when `targetType` is "vendor". */
  vendorResponse?: string;
  createdAt: string;
  /** Admin moderation (`PATCH /reviews/:id/moderate`) — hidden reviews stay in the store but drop out of public listings. */
  isHidden?: boolean;
}

export interface CreateReviewPayload {
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}

export interface RespondToReviewPayload {
  id: string;
  response: string;
}

export interface ModerateReviewPayload {
  id: string;
  isHidden: boolean;
}
