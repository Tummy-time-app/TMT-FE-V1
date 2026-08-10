import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCancelOrder,
  mockCreateOrder,
  mockGetOrder,
  mockGetOrders,
  mockGetVendorOrders,
  mockUpdateOrderStatus,
} from "@/lib/mocks/orders.mock";
import type { CreateOrderPayload, Order, OrderStatus } from "./types";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateOrder(payload) };
          const result = await fetchWithBQ({ url: "/orders", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Orders"],
    }),

    /** The current customer's own order history. */
    getOrders: builder.query<Order[], string>({
      queryFn: async (customerId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrders(customerId) };
          const result = await fetchWithBQ({ url: "/orders", params: { customerId } });
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), "Orders"] : ["Orders"],
    }),

    /** All orders placed with a given vendor — the vendor dashboard's order queue. */
    getVendorOrders: builder.query<Order[], string>({
      queryFn: async (vendorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorOrders(vendorId) };
          const result = await fetchWithBQ({ url: "/vendor/orders", params: { vendorId } });
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), "Orders"] : ["Orders"],
    }),

    getOrder: builder.query<Order, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrder(id) };
          const result = await fetchWithBQ(`/orders/${id}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    cancelOrder: builder.mutation<Order, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCancelOrder(id) };
          const result = await fetchWithBQ({ url: `/orders/${id}/cancel`, method: "PATCH" });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Orders", id }, "Orders"],
    }),

    /** Vendor-side status transition (pending → accepted → preparing → ready_for_pickup only). */
    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateOrderStatus(id, status) };
          const result = await fetchWithBQ({ url: `/orders/${id}/status`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Orders", id }, "Orders"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetVendorOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
} = ordersApi;
