import { requireAuth } from "@/lib/auth";
import { MembershipClient } from "./MembershipClient";

export default async function MembershipPage() {
  const session = await requireAuth();
  return (
    <MembershipClient
      currentTier={session.membership_tier}
      status={session.membership_status}
    />
  );
}
