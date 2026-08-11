import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockAddTicketMessage,
  mockCreateTicket,
  mockGetAllTickets,
  mockGetTicket,
  mockGetTickets,
  mockUpdateTicketStatus,
} from "@/lib/mocks/support.mock";
import type { AddTicketMessagePayload, CreateTicketPayload, SupportTicket, TicketStatus } from "./types";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<SupportTicket[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetTickets(userId) };
          const result = await fetchWithBQ("/support/tickets");
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.map((t) => ({ type: "Support" as const, id: t.id })), "Support"] : ["Support"],
    }),

    getTicket: builder.query<SupportTicket, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetTicket(id) };
          const result = await fetchWithBQ(`/support/tickets/${id}`);
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Support", id }],
    }),

    createTicket: builder.mutation<SupportTicket, CreateTicketPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateTicket(payload) };
          const result = await fetchWithBQ({ url: "/support/tickets", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Support"],
    }),

    addTicketMessage: builder.mutation<SupportTicket, AddTicketMessagePayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockAddTicketMessage(payload) };
          const result = await fetchWithBQ({
            url: `/support/tickets/${payload.ticketId}/messages`,
            method: "POST",
            body: payload,
          });
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { ticketId }) => [{ type: "Support", id: ticketId }, "Support"],
    }),

    updateTicketStatus: builder.mutation<SupportTicket, { id: string; status: TicketStatus }>({
      queryFn: async ({ id, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateTicketStatus(id, status) };
          const result = await fetchWithBQ({ url: `/support/tickets/${id}/status`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Support", id }, "Support"],
    }),

    /** Admin/support — every ticket on the platform. */
    getAllTickets: builder.query<SupportTicket[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAllTickets() };
          const result = await fetchWithBQ("/admin/support/tickets");
          if (result.error) return { error: result.error };
          return { data: result.data as SupportTicket[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Support"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAddTicketMessageMutation,
  useUpdateTicketStatusMutation,
  useGetAllTicketsQuery,
} = supportApi;
