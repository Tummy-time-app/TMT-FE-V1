import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Vendor login — TummyTime",
  description: "Log in to manage your TummyTime store.",
};

/**
 * Same shared login flow as /login (see LoginForm's doc comment) — this
 * page only exists so vendors have a login entry point that mirrors
 * /vendor/signup instead of having to find the generic customer-branded
 * one. A restaurant_owner/vendor_* account lands on /vendor either way
 * (features/auth/roleHome.ts).
 */
export default function VendorLoginPage() {
  return (
    <AuthShell>
      <Suspense>
        <LoginForm
          heading="Log in to your store"
          subtext="Manage your menu, orders, and store settings"
          signupHref="/vendor/signup"
          signupLabel="Register your restaurant"
        />
      </Suspense>
    </AuthShell>
  );
}
