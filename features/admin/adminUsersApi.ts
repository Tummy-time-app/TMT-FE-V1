import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockListUsers } from "@/lib/mocks/adminUsers.mock";
import type { AdminUser, Paginated } from "./types";

/** TMT-BE-V1's user-service adminRoutes.ts (mounted at /api/admin/users). Read-only for this pass. */
export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<Paginated<AdminUser>, { page: number; limit: number }>({
      queryFn: async ({ page, limit }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListUsers(page, limit) };
          const result = await fetchWithBQ(`/api/admin/users?page=${page}&limit=${limit}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Paginated<AdminUser> };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const { useListUsersQuery } = adminUsersApi;
