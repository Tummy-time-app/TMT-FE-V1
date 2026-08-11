import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCancelOrder,
  mockClaimDelivery,
  mockCreateOrder,
  mockGetAllOrders,
  mockGetAvailableDeliveries,
  mockGetOrder,
  mockGetOrders,
  mockGetRiderOrders,
  mockGetVendorOrders,
  mockMarkDelivered,
  mockUpdateOrderStatus,
  mockUpdateRiderLocation,
  type ClaimDeliveryInput,
} from "@/lib/mocks/orders.mock";
import type { LatLng } from "@/lib/maps/types";
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

    /** Ready-for-pickup deliveries not yet claimed by any rider — the rider dashboard's incoming feed. */
    getAvailableDeliveries: builder.query<Order[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAvailableDeliveries() };
          const result = await fetchWithBQ("/rider/available-deliveries");
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Orders"],
    }),

    /** A rider's own deliveries, active + past. */
    getRiderOrders: builder.query<Order[], string>({
      queryFn: async (riderId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRiderOrders(riderId) };
          const result = await fetchWithBQ({ url: "/rider/orders", params: { riderId } });
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.map((o) => ({ type: "Orders" as const, id: o.id })), "Orders"] : ["Orders"],
    }),

    claimDelivery: builder.mutation<Order, { orderId: string; rider: ClaimDeliveryInput }>({
      queryFn: async ({ orderId, rider }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockClaimDelivery(orderId, rider) };
          const result = await fetchWithBQ({ url: `/orders/${orderId}/claim`, method: "PATCH", body: rider });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Orders", id: orderId }, "Orders"],
    }),

    markDelivered: builder.mutation<Order, { orderId: string; riderId: string; proofNote: string }>({
      queryFn: async ({ orderId, riderId, proofNote }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockMarkDelivered(orderId, riderId, proofNote) };
          const result = await fetchWithBQ({
            url: `/orders/${orderId}/deliver`,
            method: "PATCH",
            body: { riderId, proofNote },
          });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Orders", id: orderId }, "Orders"],
    }),

    /** Fired frequently from a geolocation watcher — deliberately not shown in any loading UI. */
    updateRiderLocation: builder.mutation<Order, { orderId: string; riderId: string; location: LatLng }>({
      queryFn: async ({ orderId, riderId, location }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateRiderLocation(orderId, riderId, location) };
          const result = await fetchWithBQ({
            url: `/orders/${orderId}/rider-location`,
            method: "PATCH",
            body: { riderId, location },
          });
          if (result.error) return { error: result.error };
          return { data: result.data as Order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { orderId }) => [{ type: "Orders", id: orderId }],
    }),

    /** Admin — every order on the platform. */
    getAllOrders: builder.query<Order[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllOrders() };
          const result = await fetchWithBQ("/admin/orders");
          if (result.error) return { error: result.error };
          return { data: result.data as Order[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Orders"],
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
  useGetAvailableDeliveriesQuery,
  useGetRiderOrdersQuery,
  useClaimDeliveryMutation,
  useMarkDeliveredMutation,
  useUpdateRiderLocationMutation,
  useGetAllOrdersQuery,
} = ordersApi;
