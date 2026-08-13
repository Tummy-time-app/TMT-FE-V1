import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { logAdminAction } from "@/features/audit/logAdminAction";
import {
  mockCreateReview,
  mockGetAllReviews,
  mockGetOrderReviews,
  mockGetTargetReviews,
  mockModerateReview,
  mockRespondToReview,
} from "@/lib/mocks/reviews.mock";
import type {
  CreateReviewPayload,
  ModerateReviewPayload,
  RespondToReviewPayload,
  Review,
  ReviewTargetType,
} from "./types";

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTargetReviews: builder.query<Review[], { targetType: ReviewTargetType; targetId: string }>({
      queryFn: async ({ targetType, targetId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetTargetReviews(targetType, targetId) };
          const result = await fetchWithBQ({ url: `/reviews`, params: { targetType, targetId } });
          if (result.error) return { error: result.error };
          return { data: result.data as Review[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, { targetId }) => [{ type: "Reviews", id: targetId }],
    }),

    /** Gates the "Rate this order" UI — empty means nothing's been reviewed yet. */
    getOrderReviews: builder.query<Review[], string>({
      queryFn: async (orderId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrderReviews(orderId) };
          const result = await fetchWithBQ(`/orders/${orderId}/review`);
          if (result.error) return { error: result.error };
          return { data: result.data as Review[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, orderId) => [{ type: "Reviews", id: `ORDER-${orderId}` }],
    }),

    /** Doc §5, ReviewsModule: `POST /orders/:id/review`. */
    createReview: builder.mutation<Review, CreateReviewPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateReview(payload) };
          const result = await fetchWithBQ({ url: `/orders/${payload.orderId}/review`, method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Review };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (result, _error, payload) => [
        { type: "Reviews", id: payload.targetId },
        { type: "Reviews", id: `ORDER-${payload.orderId}` },
        "Reviews",
        "Vendors",
      ],
    }),

    respondToReview: builder.mutation<Review, RespondToReviewPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRespondToReview(payload) };
          const result = await fetchWithBQ({ url: `/reviews/${payload.id}/response`, method: "PATCH", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Review };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Reviews"],
    }),

    /** Admin — every review on the platform, including hidden ones. */
    getAllReviews: builder.query<Review[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllReviews() };
          const result = await fetchWithBQ("/admin/reviews");
          if (result.error) return { error: result.error };
          return { data: result.data as Review[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Reviews"],
    }),

    /** Doc §5, ReviewsModule: `PATCH /reviews/:id/moderate`. */
    moderateReview: builder.mutation<Review, ModerateReviewPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockModerateReview(payload) };
          const result = await fetchWithBQ({ url: `/reviews/${payload.id}/moderate`, method: "PATCH", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Review };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async ({ id, isHidden }, { getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          logAdminAction(getState, isHidden ? "review.hidden" : "review.restored", "reviews", id, undefined, { isHidden });
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: ["Reviews", "Vendors"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTargetReviewsQuery,
  useGetOrderReviewsQuery,
  useCreateReviewMutation,
  useRespondToReviewMutation,
  useGetAllReviewsQuery,
  useModerateReviewMutation,
} = reviewsApi;
