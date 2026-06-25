export const dynamic = "force-dynamic";

import { requireAuth, updateLastSeen } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardTopbar, AdminViewBanner } from "@/components/DashboardTopbar";
import { PushPrompt } from "@/components/PushPrompt";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  await updateLastSeen(session.id);

  const repo = getRepository();
  const unreadCount = await repo.getUnreadNotificationCount(session.id);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar unreadCount={unreadCount} />
      <div className="flex flex-1 flex-col md:ml-0">
        {session.role === "admin" && <AdminViewBanner />}
        <DashboardTopbar user={session} unreadCount={unreadCount} />
        <div className="flex-1 p-6">{children}</div>
      </div>
      <PushPrompt />
    </div>
  );
}
