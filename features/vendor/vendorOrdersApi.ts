import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockGetVendorDashboard,
  mockGetVendorOrders,
  mockAcceptOrder,
  mockRejectOrder,
  mockReadyOrder,
  mockHandoverOrder,
} from "@/lib/mocks/vendorOrders.mock";
import type { Order } from "@/features/orders/types";
import type {
  AcceptOrderPayload,
  OrderActionPayload,
  RejectOrderPayload,
  VendorDashboardMetrics,
  VendorOrderTab,
} from "./types";

/**
 * TMT-BE-V1's order-service vendorOrders.ts, reachable at the same
 * `/api/orders` base features/orders/ordersApi.ts already uses (it's
 * mounted there too, alongside the customer-facing orderRouter — see that
 * file's route comments, e.g. "GET /api/orders/vendor/dashboard/:id").
 *
 * Shares the "Orders" tag with ordersApi.ts rather than introducing a
 * separate one — a vendor's accept/reject/ready/handover is the same
 * underlying order row a customer's own /orders view reads, so both sides
 * should refetch together.
 */
export const vendorOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendorDashboard: builder.query<VendorDashboardMetrics, string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorDashboard(restaurantId) };
          const result = await fetchWithBQ(`/api/orders/vendor/dashboard/${restaurantId}`);
          if (result.error) return { error: result.error };
          return { data: result.data as VendorDashboardMetrics };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, restaurantId) => [{ type: "Orders", id: `vendor-${restaurantId}` }],
    }),

    getVendorOrders: builder.query<Order[], { restaurantId: string; tab: VendorOrderTab }>({
      queryFn: async ({ restaurantId, tab }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorOrders(restaurantId, tab) };
          const result = await fetchWithBQ(`/api/orders/vendor/${restaurantId}?tab=${tab}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { orders: Order[] }).orders };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      // Per-restaurant, not per-tab — accepting/rejecting moves an order
      // between tabs, so every cached tab for this store must refetch.
      providesTags: (result, _error, { restaurantId }) =>
        result
          ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), { type: "Orders", id: `vendor-${restaurantId}` }]
          : [{ type: "Orders", id: `vendor-${restaurantId}` }],
    }),

    acceptOrder: builder.mutation<Order, AcceptOrderPayload>({
      queryFn: async ({ id, restaurantId: _restaurantId, estimatedPrepTime }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockAcceptOrder(id, estimatedPrepTime) };
          const result = await fetchWithBQ({ url: `/api/orders/${id}/accept`, method: "PUT", body: { estimatedPrepTime } });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: vendorOrderInvalidation,
    }),

    rejectOrder: builder.mutation<Order, RejectOrderPayload>({
      queryFn: async ({ id, restaurantId: _restaurantId, rejectionReason, rejectionNote }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRejectOrder(id) };
          const result = await fetchWithBQ({
            url: `/api/orders/${id}/reject`,
            method: "PUT",
            body: { rejectionReason, rejectionNote },
          });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: vendorOrderInvalidation,
    }),

    markOrderReady: builder.mutation<Order, OrderActionPayload>({
      queryFn: async ({ id, restaurantId: _restaurantId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockReadyOrder(id) };
          const result = await fetchWithBQ({ url: `/api/orders/${id}/ready`, method: "PUT" });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: vendorOrderInvalidation,
    }),

    handoverOrder: builder.mutation<Order, OrderActionPayload>({
      queryFn: async ({ id, restaurantId: _restaurantId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockHandoverOrder(id) };
          const result = await fetchWithBQ({ url: `/api/orders/${id}/handover`, method: "PUT" });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: vendorOrderInvalidation,
    }),
  }),
  overrideExisting: false,
});

/** Shared by all four workflow mutations — same {id, restaurantId} payload shape. */
function vendorOrderInvalidation(_result: unknown, _error: unknown, { id, restaurantId }: { id: string; restaurantId: string }) {
  return [
    { type: "Orders" as const, id },
    { type: "Orders" as const, id: `vendor-${restaurantId}` },
    { type: "Orders" as const, id: "LIST" },
    "Notifications" as const,
  ];
}

export const {
  useGetVendorDashboardQuery,
  useGetVendorOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useMarkOrderReadyMutation,
  useHandoverOrderMutation,
} = vendorOrdersApi;
