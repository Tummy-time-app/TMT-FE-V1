import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Become a rider — TummyTime",
  description: "Sign up to deliver orders and earn with TummyTime.",
};

export default function RiderSignupPage() {
  return (
    <AuthShell>
      <RegisterForm role="rider" redirectTo="/rider" heading="Become a TummyTime rider" loginHref="/rider/login" />
    </AuthShell>
  );
}
