import { requireAuth } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await requireAuth();
  return (
    <ProfileClient
      displayName={session.display_name}
      country={session.country}
      avatarUrl={session.avatar_url}
    />
  );
}
