import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetRiderProfile, mockUpdateRiderProfile, mockUploadRiderDocument } from "@/lib/mocks/riderProfile.mock";
import type { RiderProfile, UpdateRiderProfilePayload } from "./types";

export const ridersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRiderProfile: builder.query<RiderProfile, { userId: string; vehicleType: RiderProfile["vehicleType"] }>({
      queryFn: async ({ userId, vehicleType }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRiderProfile(userId, vehicleType) };
          const result = await fetchWithBQ("/riders/me");
          if (result.error) return { error: result.error };
          return { data: result.data as RiderProfile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["RiderDocuments"],
    }),

    updateRiderProfile: builder.mutation<RiderProfile, { userId: string; patch: UpdateRiderProfilePayload }>({
      queryFn: async ({ userId, patch }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateRiderProfile(userId, patch) };
          const result = await fetchWithBQ({ url: "/riders/me", method: "PATCH", body: patch });
          if (result.error) return { error: result.error };
          return { data: result.data as RiderProfile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["RiderDocuments"],
    }),

    /** Filename-only stand-in for a real Storage-bucket upload (doc §7's `rider-documents` bucket) — see riderProfile.mock.ts. */
    uploadRiderDocument: builder.mutation<RiderProfile, { userId: string; kind: "idDocument" | "vehicleDoc"; fileName: string }>({
      queryFn: async ({ userId, kind, fileName }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUploadRiderDocument(userId, kind, fileName) };
          const result = await fetchWithBQ({ url: "/riders/me/documents", method: "POST", body: { kind, fileName } });
          if (result.error) return { error: result.error };
          return { data: result.data as RiderProfile };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["RiderDocuments"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRiderProfileQuery, useUpdateRiderProfileMutation, useUploadRiderDocumentMutation } = ridersApi;
