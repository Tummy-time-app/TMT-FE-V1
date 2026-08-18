import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockCreateOrder, mockGetOrder, mockListOrders, mockUpdateOrderStatus } from "@/lib/mocks/orders.mock";
import type { CreateOrderPayload, Order, OrderStatus } from "./types";

/**
 * TMT-BE-V1's order-service (services/order-service/src/routes/orders.ts).
 * Customer-facing subset only — no vendor accept/reject/ready/handover
 * endpoints here, same reasoning as restaurantsApi.ts/authApi.ts. Order
 * creation also triggers a RabbitMQ event the real backend's
 * notification-service consumes — see notificationsApi.ts.
 */
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateOrder(payload) };
          const result = await fetchWithBQ({ url: "/api/orders", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: [{ type: "Orders", id: "LIST" }, "Notifications"],
    }),

    listOrders: builder.query<Order[], { customerId?: string; restaurantId?: string }>({
      queryFn: async (filter, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListOrders(filter) };
          const params = new URLSearchParams();
          if (filter.customerId) params.set("customerId", filter.customerId);
          if (filter.restaurantId) params.set("restaurantId", filter.restaurantId);
          const qs = params.toString();
          const result = await fetchWithBQ(`/api/orders${qs ? `?${qs}` : ""}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { orders: Order[] }).orders };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), { type: "Orders", id: "LIST" }]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getOrder: builder.query<Order, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrder(id) };
          const result = await fetchWithBQ(`/api/orders/${id}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    /** Also how a customer cancels — PATCH status to "cancelled" (there's no separate cancel endpoint). */
    updateOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateOrderStatus(id, status) };
          const result = await fetchWithBQ({ url: `/api/orders/${id}/status`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Orders", id }, { type: "Orders", id: "LIST" }, "Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
