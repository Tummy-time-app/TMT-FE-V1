import type { UserRole } from "@/features/auth/types";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  /** Filename only — stands in for a real attachment upload (spec §33, not yet built). */
  attachmentName?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  userId: string;
  userName: string;
  userRole: UserRole;
  subject: string;
  priority: TicketPriority;
  message: string;
}

export interface AddTicketMessagePayload {
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  attachmentName?: string;
}
