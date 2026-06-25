export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { PushPrompt } from "@/components/PushPrompt";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-card-border px-6 py-4 lg:pl-6">
          <p className="ml-12 font-display text-lg lg:ml-0">Admin Panel</p>
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost text-xs">Log out</button>
          </form>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </div>
      <PushPrompt />
    </div>
  );
}
