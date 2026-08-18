import type { Metadata } from "next";
import { ProfileShell } from "@/components/profile/ProfileShell";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Your profile — TummyTime",
  description: "View and edit your TummyTime profile.",
};

export default function ProfilePage() {
  return (
    <ProfileShell>
      <ProfileView />
    </ProfileShell>
  );
}
