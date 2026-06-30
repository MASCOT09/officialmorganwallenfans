export const dynamic = "force-dynamic";

import { requireAuth, updateLastSeen } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { AdminControlsPanel } from "@/components/portal/AdminControlsPanel";
import { PushPrompt } from "@/components/PushPrompt";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  await updateLastSeen(session.id);

  const repo = getRepository();
  const unreadCount = await repo.getUnreadNotificationCount(session.id);

  return (
    <div className="flex min-h-screen bg-[#121810]">
      <DashboardSidebar user={session} unreadCount={unreadCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar user={session} unreadCount={unreadCount} homeHref="/" homeLabel="Site" />
        <div className="flex-1 space-y-6 p-4 lg:p-6">
          {session.role === "admin" && <AdminControlsPanel />}
          {children}
        </div>
      </div>
      <PushPrompt />
    </div>
  );
}
