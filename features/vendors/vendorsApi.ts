import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockGetAllVendorsAdmin,
  mockGetVendorCategories,
  mockGetVendorDetail,
  mockGetVendors,
  mockSetVendorApprovalStatus,
} from "@/lib/mocks/vendors.mock";
import type { Vendor, VendorApprovalStatus, VendorCategory, VendorDetail, VendorQueryParams, VendorsResponse } from "./types";

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

    /** Admin — approve/suspend/reactivate a vendor. */
    setVendorApprovalStatus: builder.mutation<Vendor, { vendorId: string; status: VendorApprovalStatus }>({
      queryFn: async ({ vendorId, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockSetVendorApprovalStatus(vendorId, status) };
          const result = await fetchWithBQ({ url: `/admin/vendors/${vendorId}/status`, method: "PATCH", body: { status } });
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
} = vendorsApi;
