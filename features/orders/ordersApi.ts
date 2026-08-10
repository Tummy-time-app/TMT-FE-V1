import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockCancelOrder, mockCreateOrder, mockGetOrder, mockGetOrders } from "@/lib/mocks/orders.mock";
import type { CreateOrderPayload, Order } from "./types";

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

    getOrders: builder.query<Order[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetOrders() };
          const result = await fetchWithBQ("/orders");
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), "Orders"]
          : ["Orders"],
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
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
} = ordersApi;
