import Link from "next/link";
import { Bell } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/types";

export function DashboardTopbar({
  user,
  unreadCount,
}: {
  user: SessionUser;
  unreadCount: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-card-border px-6 py-4 md:pl-6">
      <div className="ml-12 md:ml-0">
        <p className="text-xs uppercase tracking-widest text-muted">Welcome back</p>
        <h1 className="font-display text-xl">{user.display_name}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications" className="relative text-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-background">
              {unreadCount}
            </span>
          )}
        </Link>
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
            {user.display_name[0]?.toUpperCase()}
          </span>
        )}
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost text-xs">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

export function AdminViewBanner() {
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-6 py-3 text-sm">
      You are viewing the fan dashboard as an admin.{" "}
      <Link href="/admin" className="font-medium text-accent underline">
        Admin tools
      </Link>{" "}
      ·{" "}
      <Link href="/admin/messages" className="font-medium text-accent underline">
        Chat with fans
      </Link>
    </div>
  );
}
