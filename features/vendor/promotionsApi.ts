import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetPromotions, mockCreatePromotion } from "@/lib/mocks/vendorPromotions.mock";
import type { CreatePromotionPayload, Promotion } from "./types";

/** TMT-BE-V1's restaurant-service vendor.ts promotions routes — GET/POST `/api/restaurants/:id/promotions`. */
export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<Promotion[], string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetPromotions(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/promotions`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { promotions: Promotion[] }).promotions };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result, _error, restaurantId) =>
        result
          ? [...result.map((p) => ({ type: "Promotions" as const, id: p.id })), { type: "Promotions", id: restaurantId }]
          : [{ type: "Promotions", id: restaurantId }],
    }),

    createPromotion: builder.mutation<Promotion, CreatePromotionPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreatePromotion(payload) };
          const { restaurantId, ...body } = payload;
          const result = await fetchWithBQ({ url: `/api/restaurants/${restaurantId}/promotions`, method: "POST", body });
          if (result.error) return { error: result.error };
          return { data: (result.data as { promotion: Promotion }).promotion };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, payload) => [{ type: "Promotions", id: payload.restaurantId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPromotionsQuery, useCreatePromotionMutation } = promotionsApi;
