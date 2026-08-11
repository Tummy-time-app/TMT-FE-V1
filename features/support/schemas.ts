import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  priority: z.enum(["low", "medium", "high"]),
  message: z.string().min(10, "Please describe your issue in a bit more detail."),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
