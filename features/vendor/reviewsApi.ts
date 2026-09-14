import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetReviews, mockReplyToReview } from "@/lib/mocks/vendorReviews.mock";
import type { Review, ReviewsSummary } from "./types";

/** TMT-BE-V1's restaurant-service vendor.ts reviews routes. */
export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsSummary, string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetReviews(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/reviews`);
          if (result.error) return { error: result.error };
          return { data: result.data as ReviewsSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, restaurantId) => [{ type: "Reviews", id: restaurantId }],
    }),

    /** `restaurantId` travels for cache-invalidation only — same precedent as vendorOrdersApi.ts. */
    replyToReview: builder.mutation<Review, { reviewId: string; restaurantId: string; vendorReply: string }>({
      queryFn: async ({ reviewId, vendorReply }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockReplyToReview(reviewId, vendorReply) };
          const result = await fetchWithBQ({
            url: `/api/restaurants/reviews/${reviewId}/reply`,
            method: "POST",
            body: { vendorReply },
          });
          if (result.error) return { error: result.error };
          return { data: (result.data as { review: Review }).review };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { restaurantId }) => [{ type: "Reviews", id: restaurantId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetReviewsQuery, useReplyToReviewMutation } = reviewsApi;
