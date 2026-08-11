import { z } from "zod";

export const promotionSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters.")
    .max(20, "Code must be 20 characters or fewer.")
    .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Enter a value greater than 0."),
  minOrderAmount: z.number().nonnegative().optional(),
  expiresAt: z.string().min(1, "Choose an expiry date."),
  usageLimit: z.number().positive().optional(),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
