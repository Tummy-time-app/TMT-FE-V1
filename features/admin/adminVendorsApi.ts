import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockListVendors, mockUpdateVendorApproval, mockDeleteVendor } from "@/lib/mocks/adminVendors.mock";
import type { Restaurant } from "@/features/restaurants/types";
import type { Paginated } from "./types";

/** TMT-BE-V1's restaurant-service adminRestaurants.ts (mounted at /api/admin/restaurants). Shares the "Restaurants" tag with restaurantsApi.ts. */
export const adminVendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listVendors: builder.query<Paginated<Restaurant>, { page: number; limit: number }>({
      queryFn: async ({ page, limit }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListVendors(page, limit) };
          const result = await fetchWithBQ(`/api/admin/restaurants?page=${page}&limit=${limit}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Paginated<Restaurant> };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.data.map((r) => ({ type: "Restaurants" as const, id: r.id })), { type: "Restaurants", id: "admin-LIST" }] : [{ type: "Restaurants", id: "admin-LIST" }],
    }),

    updateVendorApproval: builder.mutation<
      Restaurant,
      { id: string; verificationStatus?: Restaurant["verificationStatus"]; approved?: boolean }
    >({
      queryFn: async ({ id, ...updates }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateVendorApproval(id, updates) };
          const result = await fetchWithBQ({ url: `/api/admin/restaurants/${id}/approval`, method: "PATCH", body: updates });
          if (result.error) return { error: result.error };
          return { data: (result.data as { restaurant: Restaurant }).restaurant };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Restaurants", id }, { type: "Restaurants", id: "admin-LIST" }],
    }),

    deleteVendor: builder.mutation<null, { id: string }>({
      queryFn: async ({ id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) {
            await mockDeleteVendor(id);
            return { data: null };
          }
          const result = await fetchWithBQ({ url: `/api/admin/restaurants/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: null };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: [{ type: "Restaurants", id: "admin-LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListVendorsQuery, useUpdateVendorApprovalMutation, useDeleteVendorMutation } = adminVendorsApi;
