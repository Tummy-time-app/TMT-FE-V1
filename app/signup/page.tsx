import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Sign up — TummyTime",
  description: "Create a TummyTime account.",
};

export default function SignupPage() {
  return (
    <AuthShell>
      <AuthCard
        heading="What's your phone number or email?"
        redirectTo="/onboarding"
        footer={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-neutral-900 underline underline-offset-2"
            >
              Log in
            </Link>
          </>
        }
      />
    </AuthShell>
  );
}
