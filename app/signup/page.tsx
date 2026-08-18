import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up — TummyTime",
  description: "Create a TummyTime account.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
