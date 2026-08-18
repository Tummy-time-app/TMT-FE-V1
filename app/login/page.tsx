import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = {
  title: "Log in — TummyTime",
  description: "Log in to your TummyTime account.",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthCard
        heading="What's your phone number or email?"
        footer={
          <>
            New to TummyTime?{" "}
            <Link
              href="/signup"
              className="font-semibold text-neutral-900 underline underline-offset-2"
            >
              Sign up
            </Link>
          </>
        }
      />
    </AuthShell>
  );
}
