import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register your restaurant — TummyTime",
  description: "Create a TummyTime vendor account and set up your store.",
};

export default function VendorSignupPage() {
  return (
    <AuthShell>
      <RegisterForm
        role="restaurant_owner"
        redirectTo="/vendor"
        heading="Register your restaurant"
      />
    </AuthShell>
  );
}
