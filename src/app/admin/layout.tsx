export const dynamic = "force-dynamic";

import { requireAdmin, updateLastSeen } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { PushPrompt } from "@/components/PushPrompt";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  await updateLastSeen(session.id);

  const repo = getRepository();
  const unreadCount = await repo.getUnreadNotificationCount(session.id);

  return (
    <div className="flex min-h-screen bg-[#121810]">
      <AdminSidebar user={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar
          user={session}
          unreadCount={unreadCount}
          homeHref="/dashboard"
          homeLabel="Fan dashboard"
        />
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </div>
      <PushPrompt />
    </div>
  );
}
