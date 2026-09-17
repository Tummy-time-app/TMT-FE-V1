import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockListAllShopperRequests, mockUpdateShopperRequestStatus } from "@/lib/mocks/personalShopper.mock";
import type { Paginated } from "./types";
import type { ShopperRequest, ShopperRequestStatus } from "@/features/personalShopper/types";

/**
 * TMT-BE-V1's order-service adminShopperRequests.ts (mounted at
 * /api/admin/shopper-requests). The manual stand-in for shopper assignment —
 * no real shopper workforce/app exists, mirrors adminRidersApi.ts's verify
 * pattern exactly.
 */
export const adminShopperRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listShopperRequests: builder.query<Paginated<ShopperRequest>, { page: number; limit: number }>({
      queryFn: async ({ page, limit }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListAllShopperRequests(page, limit) };
          const result = await fetchWithBQ(`/api/admin/shopper-requests?page=${page}&limit=${limit}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Paginated<ShopperRequest> };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.data.map((r) => ({ type: "ShopperRequests" as const, id: r.id })), { type: "ShopperRequests", id: "LIST" }]
          : [{ type: "ShopperRequests", id: "LIST" }],
    }),

    updateShopperRequestStatus: builder.mutation<null, { id: string; status: ShopperRequestStatus; assignedShopperName?: string }>({
      queryFn: async ({ id, status, assignedShopperName }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) {
            await mockUpdateShopperRequestStatus(id, status, assignedShopperName);
            return { data: null };
          }
          const result = await fetchWithBQ({
            url: `/api/admin/shopper-requests/${id}/status`,
            method: "PATCH",
            body: { status, assignedShopperName },
          });
          if (result.error) return { error: result.error };
          return { data: null };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "ShopperRequests", id }, { type: "ShopperRequests", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useListShopperRequestsQuery, useUpdateShopperRequestStatusMutation } = adminShopperRequestsApi;
