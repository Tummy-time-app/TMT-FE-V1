import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin login — TummyTime",
  description: "Sign in to the TummyTime admin dashboard.",
};

/**
 * Mirrors app/vendor/login/page.tsx / app/rider/login/page.tsx — same
 * shared login flow. Deliberately no app/admin/signup/page.tsx: admin
 * accounts aren't self-service (see auth.ts's ALLOWED_ROLES, which
 * excludes "admin" — bootstrapped instead via user-service's
 * db/seedAdmin.ts script).
 */
export default function AdminLoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <LoginForm
          heading="Admin sign in"
          subtext="Restricted to TummyTime staff accounts"
          signupHref="/"
          signupPrompt="Not staff?"
          signupLabel="Back to TummyTime"
        />
      </Suspense>
    </AuthShell>
  );
}
