import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Rider login — TummyTime",
  description: "Log in to start delivering with TummyTime.",
};

/** Mirrors app/vendor/login/page.tsx — same shared login flow (see LoginForm's doc comment), just parameterized. A rider account lands on /rider either way (features/auth/roleHome.ts). */
export default function RiderLoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <LoginForm
          heading="Log in to deliver"
          subtext="Accept deliveries and track your earnings"
          signupHref="/rider/signup"
          signupLabel="Become a rider"
        />
      </Suspense>
    </AuthShell>
  );
}
