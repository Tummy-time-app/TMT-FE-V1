import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockListAvailableDeliveries,
  mockAcceptDelivery,
  mockRiderArrived,
  mockRiderPickup,
  mockRiderDeliver,
} from "@/lib/mocks/riderOrders.mock";
import type { Order, RiderInfo } from "@/features/orders/types";

/**
 * TMT-BE-V1's order-service riderOrders.ts (mounted at /api/rider/orders).
 * Shares the "Orders" tag with ordersApi.ts/vendorOrdersApi.ts — a rider's
 * accept/arrived/pickup/deliver mutates the same order row the customer's
 * own /orders view and the vendor portal both read, same reasoning as
 * vendorOrdersApi.ts's doc comment.
 */
export const riderOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableDeliveries: builder.query<Order[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListAvailableDeliveries() };
          const result = await fetchWithBQ("/api/rider/orders/available");
          if (result.error) return { error: result.error };
          return { data: (result.data as { orders: Order[] }).orders };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), { type: "Orders", id: "rider-available" }]
          : [{ type: "Orders", id: "rider-available" }],
    }),

    acceptDelivery: builder.mutation<Order, { id: string } & RiderInfo>({
      queryFn: async ({ id, ...riderInfo }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockAcceptDelivery(id, riderInfo) };
          const result = await fetchWithBQ({ url: `/api/rider/orders/${id}/accept`, method: "PUT", body: riderInfo });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: riderOrderInvalidation,
    }),

    markRiderArrived: builder.mutation<Order, { id: string }>({
      queryFn: async ({ id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRiderArrived(id) };
          const result = await fetchWithBQ({ url: `/api/rider/orders/${id}/arrived`, method: "PUT" });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: riderOrderInvalidation,
    }),

    confirmPickup: builder.mutation<Order, { id: string }>({
      queryFn: async ({ id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRiderPickup(id) };
          const result = await fetchWithBQ({ url: `/api/rider/orders/${id}/pickup`, method: "PUT" });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: riderOrderInvalidation,
    }),

    completeDelivery: builder.mutation<Order, { id: string; pin: string }>({
      queryFn: async ({ id, pin }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRiderDeliver(id, pin) };
          const result = await fetchWithBQ({ url: `/api/rider/orders/${id}/deliver`, method: "PUT", body: { pin } });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (result, error, { id }) => [...riderOrderInvalidation(result, error, { id }), "Wallet", "Cashback", "Loyalty", "FreeDelivery", "RiderEarnings"],
    }),
  }),
  overrideExisting: false,
});

function riderOrderInvalidation(_result: unknown, _error: unknown, { id }: { id: string }) {
  return [
    { type: "Orders" as const, id },
    { type: "Orders" as const, id: "rider-available" },
    { type: "Orders" as const, id: "LIST" },
    "Notifications" as const,
  ];
}

export const {
  useGetAvailableDeliveriesQuery,
  useAcceptDeliveryMutation,
  useMarkRiderArrivedMutation,
  useConfirmPickupMutation,
  useCompleteDeliveryMutation,
} = riderOrdersApi;
