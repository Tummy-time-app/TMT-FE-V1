import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { logAdminAction } from "@/features/audit/logAdminAction";
import { linkVendor } from "@/features/auth/authSlice";
import {
  mockCreateVendor,
  mockGetAllVendorsAdmin,
  mockGetVendorCategories,
  mockGetVendorDetail,
  mockGetVendors,
  mockSetVendorApprovalStatus,
  mockSetVendorOperatingHours,
  mockSetVendorTemporarilyClosed,
} from "@/lib/mocks/vendors.mock";
import type {
  CreateVendorPayload,
  OperatingHours,
  Vendor,
  VendorApprovalStatus,
  VendorCategory,
  VendorDetail,
  VendorQueryParams,
  VendorsResponse,
} from "./types";

export const vendorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<VendorsResponse, VendorQueryParams | void>({
      queryFn: async (params, _api, _extra, fetchWithBQ) => {
        try {
          const query = params ?? {};
          if (isDevMode) return { data: await mockGetVendors(query) };
          const result = await fetchWithBQ({ url: "/vendors", params: query });
          if (result.error) return { error: result.error };
          return { data: result.data as VendorsResponse };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Vendors"],
    }),

    getVendorCategories: builder.query<VendorCategory[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorCategories() };
          const result = await fetchWithBQ("/vendors/categories");
          if (result.error) return { error: result.error };
          return { data: result.data as VendorCategory[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    getVendorDetail: builder.query<VendorDetail, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorDetail(id) };
          const result = await fetchWithBQ(`/vendors/${id}`);
          if (result.error) return { error: result.error };
          return { data: result.data as VendorDetail };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Vendors", id }],
    }),

    /** Admin — every vendor regardless of approval status. */
    getAllVendorsAdmin: builder.query<Vendor[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllVendorsAdmin() };
          const result = await fetchWithBQ("/admin/vendors");
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Vendors"],
    }),

    /**
     * Admin — approve/suspend/reactivate a vendor. Doc §5's sample is
     * `PATCH /admin/vendors/:id/approve` — one action-specific route per
     * transition rather than a generic `/status` patch, so `pending` (a
     * reinstate-to-review case) maps to `/reinstate` there too.
     */
    setVendorApprovalStatus: builder.mutation<Vendor, { vendorId: string; status: VendorApprovalStatus }>({
      queryFn: async ({ vendorId, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetVendorApprovalStatus(vendorId, status) };
          const action: Record<VendorApprovalStatus, string> = {
            approved: "approve",
            suspended: "suspend",
            pending: "reinstate",
          };
          const result = await fetchWithBQ({ url: `/admin/vendors/${vendorId}/${action[status]}`, method: "PATCH" });
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async ({ vendorId, status }, { getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          logAdminAction(getState, `vendor.${status}`, "vendors", vendorId, undefined, { status });
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: (_result, _error, { vendorId }) => ["Vendors", { type: "Vendors", id: vendorId }],
    }),

    /** Vendor self-service — doc §5's `POST /vendors/:id/close-temporarily`. */
    setVendorTemporarilyClosed: builder.mutation<Vendor, { vendorId: string; closed: boolean }>({
      queryFn: async ({ vendorId, closed }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetVendorTemporarilyClosed(vendorId, closed) };
          const result = await fetchWithBQ({
            url: closed ? `/vendors/${vendorId}/close-temporarily` : `/vendors/${vendorId}/reopen`,
            method: "POST",
          });
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { vendorId }) => ["Vendors", { type: "Vendors", id: vendorId }],
    }),

    /** Doc §5, VendorsModule: `POST /vendors` — "Vendor onboarding". */
    createVendor: builder.mutation<Vendor, { ownerId: string; payload: CreateVendorPayload }>({
      queryFn: async ({ ownerId, payload }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateVendor(ownerId, payload) };
          const result = await fetchWithBQ({ url: "/vendors", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async (_arg, { dispatch, getState, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Patch the Redux-cached user immediately — RoleShell/vendor pages read `user.vendorId` synchronously and shouldn't need a re-login to see the new store.
          dispatch(linkVendor(data.id));
          logAdminAction(getState, "vendor.onboarded", "vendors", data.id, undefined, { name: data.name });
        } catch {
          // mutation failed — nothing to link/log
        }
      },
      invalidatesTags: ["Vendors", "Auth"],
    }),

    /** Vendor self-service — doc §5's `PATCH /vendors/:id/hours`. */
    setVendorOperatingHours: builder.mutation<Vendor, { vendorId: string; hours: OperatingHours }>({
      queryFn: async ({ vendorId, hours }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetVendorOperatingHours(vendorId, hours) };
          const result = await fetchWithBQ({ url: `/vendors/${vendorId}/hours`, method: "PATCH", body: hours });
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { vendorId }) => ["Vendors", { type: "Vendors", id: vendorId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVendorsQuery,
  useGetVendorCategoriesQuery,
  useGetVendorDetailQuery,
  useGetAllVendorsAdminQuery,
  useSetVendorApprovalStatusMutation,
  useSetVendorTemporarilyClosedMutation,
  useCreateVendorMutation,
  useSetVendorOperatingHoursMutation,
} = vendorsApi;
