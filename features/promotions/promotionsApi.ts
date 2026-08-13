import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreatePromotion,
  mockDeletePromotion,
  mockGetAllPromotions,
  mockGetPromotions,
  mockGetVendorPromotions,
  mockUpdatePromotion,
  mockValidatePromoCode,
} from "@/lib/mocks/promotions.mock";
import type { CreatePromotionPayload, Promotion, ValidatePromoInput, ValidatePromoResult } from "./types";

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromotions: builder.query<Promotion[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetPromotions() };
          const result = await fetchWithBQ("/promotions");
          if (result.error) return { error: result.error };
          return { data: result.data as Promotion[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Promotions"],
    }),

    /** JWT-scoped in real mode (see ordersApi.ts's getVendorOrders note) — `vendorId` only drives dev-mode's mock filter. */
    getVendorPromotions: builder.query<Promotion[], string>({
      queryFn: async (vendorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorPromotions(vendorId) };
          const result = await fetchWithBQ("/vendor/promotions");
          if (result.error) return { error: result.error };
          return { data: result.data as Promotion[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Promotions"],
    }),

    validatePromoCode: builder.mutation<ValidatePromoResult, ValidatePromoInput>({
      queryFn: async (input, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockValidatePromoCode(input) };
          const result = await fetchWithBQ({ url: "/promotions/validate", method: "POST", body: input });
          if (result.error) return { error: result.error };
          return { data: result.data as ValidatePromoResult };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    createPromotion: builder.mutation<Promotion, CreatePromotionPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreatePromotion(payload) };
          const result = await fetchWithBQ({ url: "/promotions", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Promotion };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Promotions"],
    }),

    updatePromotion: builder.mutation<Promotion, { id: string; patch: Partial<CreatePromotionPayload & { active: boolean }> }>({
      queryFn: async ({ id, patch }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdatePromotion(id, patch) };
          const result = await fetchWithBQ({ url: `/promotions/${id}`, method: "PATCH", body: patch });
          if (result.error) return { error: result.error };
          return { data: result.data as Promotion };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Promotions"],
    }),

    deletePromotion: builder.mutation<{ id: string }, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDeletePromotion(id) };
          const result = await fetchWithBQ({ url: `/promotions/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { id: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Promotions"],
    }),

    /** Admin — every promotion on the platform, active or not. */
    getAllPromotions: builder.query<Promotion[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllPromotions() };
          const result = await fetchWithBQ("/admin/promotions");
          if (result.error) return { error: result.error };
          return { data: result.data as Promotion[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Promotions"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPromotionsQuery,
  useGetVendorPromotionsQuery,
  useValidatePromoCodeMutation,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetAllPromotionsQuery,
} = promotionsApi;
