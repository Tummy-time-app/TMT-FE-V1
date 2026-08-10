import { RequireAuth } from "@/components/auth/RequireAuth";
import { VendorShell } from "@/components/layout/VendorShell";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={["vendor"]}>
      <VendorShell>{children}</VendorShell>
    </RequireAuth>
  );
}
