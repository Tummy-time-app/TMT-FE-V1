import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateShopperRequest,
  mockGetShopperRequest,
  mockListMyShopperRequests,
} from "@/lib/mocks/personalShopper.mock";
import type { CreateShopperRequestPayload, ShopperRequest } from "./types";

/**
 * TMT-BE-V1's order-service shopperRequests.ts (mounted at
 * /api/shopper-requests, versioned counterpart /api/v1/user/shopper-requests).
 * Customer-facing subset only — see features/admin/adminShopperRequestsApi.ts
 * for the admin-side status-advance endpoint.
 */
export const personalShopperApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createShopperRequest: builder.mutation<ShopperRequest, CreateShopperRequestPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateShopperRequest(payload) };
          const result = await fetchWithBQ({ url: "/api/shopper-requests", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: (result.data as { request: ShopperRequest }).request };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: [{ type: "ShopperRequests", id: "LIST" }],
    }),

    listMyShopperRequests: builder.query<ShopperRequest[], string>({
      queryFn: async (customerId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListMyShopperRequests(customerId) };
          const result = await fetchWithBQ(`/api/shopper-requests?customerId=${encodeURIComponent(customerId)}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { requests: ShopperRequest[] }).requests };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((r) => ({ type: "ShopperRequests" as const, id: r.id })), { type: "ShopperRequests", id: "LIST" }]
          : [{ type: "ShopperRequests", id: "LIST" }],
    }),

    getShopperRequest: builder.query<ShopperRequest, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetShopperRequest(id) };
          const result = await fetchWithBQ(`/api/shopper-requests/${id}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { request: ShopperRequest }).request };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "ShopperRequests", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateShopperRequestMutation, useListMyShopperRequestsQuery, useGetShopperRequestQuery } = personalShopperApi;
