"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { SessionUser } from "@/lib/types";

interface PortalTopbarProps {
  user: SessionUser;
  unreadCount: number;
  homeHref?: string;
  homeLabel?: string;
}

export function PortalTopbar({
  user,
  unreadCount,
  homeHref = "/",
  homeLabel = "Site",
}: PortalTopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border px-4 py-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 pl-12 lg:pl-0">
        <label className="relative hidden max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search..."
            className="input-field pl-10 text-sm"
            aria-label="Search dashboard"
          />
        </label>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <p className="hidden text-sm text-muted md:block">
          Welcome back, <span className="text-foreground">{user.display_name}</span> 👋
        </p>
        <Link href={homeHref} className="btn-ghost hidden text-xs sm:inline-flex">
          {homeLabel}
        </Link>
        <Link href="/dashboard/notifications" className="relative text-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-background">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/dashboard/profile" className="shrink-0">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
              {user.display_name[0]?.toUpperCase()}
            </span>
          )}
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost text-xs">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
