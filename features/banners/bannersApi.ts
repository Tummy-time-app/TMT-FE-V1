import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { logAdminAction } from "@/features/audit/logAdminAction";
import {
  mockCreateBanner,
  mockDeleteBanner,
  mockGetActiveBanners,
  mockGetAllBanners,
  mockUpdateBanner,
} from "@/lib/mocks/banners.mock";
import type { Banner, BannerPlacement, CreateBannerPayload, UpdateBannerPayload } from "./types";

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveBanners: builder.query<Banner[], BannerPlacement>({
      queryFn: async (placement, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetActiveBanners(placement) };
          const result = await fetchWithBQ({ url: "/banners", params: { placement } });
          if (result.error) return { error: result.error };
          return { data: result.data as Banner[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Banners"],
    }),

    /** Admin — every banner, including scheduled/expired/inactive ones. */
    getAllBanners: builder.query<Banner[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllBanners() };
          const result = await fetchWithBQ("/admin/banners");
          if (result.error) return { error: result.error };
          return { data: result.data as Banner[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Banners"],
    }),

    createBanner: builder.mutation<Banner, CreateBannerPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateBanner(payload) };
          const result = await fetchWithBQ({ url: "/admin/banners", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Banner };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async (payload, { getState, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          logAdminAction(getState, "banner.created", "cms_banners", data.id, undefined, payload);
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: ["Banners"],
    }),

    updateBanner: builder.mutation<Banner, UpdateBannerPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateBanner(payload) };
          const result = await fetchWithBQ({ url: `/admin/banners/${payload.id}`, method: "PATCH", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Banner };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async (payload, { getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          logAdminAction(getState, "banner.updated", "cms_banners", payload.id, undefined, payload);
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: ["Banners"],
    }),

    deleteBanner: builder.mutation<{ id: string }, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDeleteBanner(id) };
          const result = await fetchWithBQ({ url: `/admin/banners/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { id: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      onQueryStarted: async (id, { getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          logAdminAction(getState, "banner.deleted", "cms_banners", id);
        } catch {
          // mutation failed — nothing to log
        }
      },
      invalidatesTags: ["Banners"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetActiveBannersQuery,
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApi;
