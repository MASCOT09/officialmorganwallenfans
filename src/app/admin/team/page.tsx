import { requireAdmin } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { TeamAdminClient } from "./TeamAdminClient";

export default async function AdminTeamPage() {
  const admin = await requireAdmin();
  const repo = getRepository();
  const fans = await repo.getFansForMessaging();
  const admins = await repo.getAllAdmins();
  const stats = await repo.getCommunityStats();

  return (
    <TeamAdminClient
      fans={fans}
      admins={admins}
      stats={stats}
      currentUserId={admin.id}
    />
  );
}
