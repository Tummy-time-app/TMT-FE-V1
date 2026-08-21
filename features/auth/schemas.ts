import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * No forgot-password/reset-password schemas here — those flows don't exist
 * on TMT-BE-V1 (see authApi.ts's doc comment). No OTP schema either: email
 * verification is real now, but it's an emailed link the backend confirms
 * server-side, not a code entered into a form here.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required.")
      .min(2, "Name must be at least 2 characters."),
    email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
    phone: z
      .string()
      .min(1, "Phone number is required.")
      .regex(/^[+\d][\d\s-]{7,}$/, "Enter a valid phone number."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[0-9]/, "Include at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
