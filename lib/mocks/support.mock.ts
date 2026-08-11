import { mockDelay } from "@/lib/dev/devMode";
import type {
  AddTicketMessagePayload,
  CreateTicketPayload,
  SupportTicket,
  TicketMessage,
  TicketStatus,
} from "@/features/support/types";

/** DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern. */

const TICKETS_STORAGE_KEY = "tummytime_mock_tickets";

function loadTickets(): SupportTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TICKETS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupportTicket[]) : [];
  } catch {
    return [];
  }
}

function saveTickets(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
}

export async function mockCreateTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
  await mockDelay(600);
  const now = new Date().toISOString();
  const firstMessage: TicketMessage = {
    id: `MSG-${Date.now().toString(36).toUpperCase()}`,
    senderId: payload.userId,
    senderName: payload.userName,
    senderRole: payload.userRole,
    message: payload.message,
    createdAt: now,
  };
  const ticket: SupportTicket = {
    id: `TCK-${Date.now().toString(36).toUpperCase()}`,
    userId: payload.userId,
    userName: payload.userName,
    userRole: payload.userRole,
    subject: payload.subject,
    priority: payload.priority,
    status: "open",
    messages: [firstMessage],
    createdAt: now,
    updatedAt: now,
  };
  saveTickets([ticket, ...loadTickets()]);
  return ticket;
}

export async function mockGetTickets(userId: string): Promise<SupportTicket[]> {
  await mockDelay(350);
  return loadTickets()
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function mockGetTicket(id: string): Promise<SupportTicket> {
  await mockDelay(300);
  const ticket = loadTickets().find((t) => t.id === id);
  if (!ticket) throw { status: 404, message: "We couldn't find this ticket." };
  return ticket;
}

export async function mockAddTicketMessage(payload: AddTicketMessagePayload): Promise<SupportTicket> {
  await mockDelay(500);
  const tickets = loadTickets();
  const idx = tickets.findIndex((t) => t.id === payload.ticketId);
  if (idx === -1) throw { status: 404, message: "We couldn't find this ticket." };

  const message: TicketMessage = {
    id: `MSG-${Date.now().toString(36).toUpperCase()}`,
    senderId: payload.senderId,
    senderName: payload.senderName,
    senderRole: payload.senderRole,
    message: payload.message,
    attachmentName: payload.attachmentName,
    createdAt: new Date().toISOString(),
  };

  const ticket = tickets[idx];
  // The original requester replying to a resolved/closed ticket reopens it.
  const reopens = payload.senderId === ticket.userId && (ticket.status === "resolved" || ticket.status === "closed");

  tickets[idx] = {
    ...ticket,
    messages: [...ticket.messages, message],
    status: reopens ? "open" : ticket.status,
    updatedAt: message.createdAt,
  };
  saveTickets(tickets);
  return tickets[idx];
}

/** Admin/support — every ticket on the platform. */
export async function mockGetAllTickets(): Promise<SupportTicket[]> {
  await mockDelay(400);
  return loadTickets().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function mockUpdateTicketStatus(id: string, status: TicketStatus): Promise<SupportTicket> {
  await mockDelay(400);
  const tickets = loadTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) throw { status: 404, message: "We couldn't find this ticket." };
  tickets[idx] = { ...tickets[idx], status, updatedAt: new Date().toISOString() };
  saveTickets(tickets);
  return tickets[idx];
}
