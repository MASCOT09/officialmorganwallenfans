"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crown,
  MessageSquare,
  Calendar,
  Gift,
  Ticket,
  MessageCircle,
  Bell,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/membership", label: "Membership", icon: Crown },
  { href: "/dashboard/messages", label: "My Messages", icon: MessageSquare },
  { href: "/dashboard/meet-greet", label: "Meet & Greet", icon: Calendar },
  { href: "/dashboard/giveaways", label: "Giveaways", icon: Gift },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/contact", label: "Private DMs", icon: MessageCircle },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        const badge = label === "Notifications" && unreadCount > 0 ? unreadCount : null;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
              active
                ? "bg-accent/15 text-accent"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {badge !== null && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-background">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-card-border bg-card p-2 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-card-border bg-background transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-card-border p-4 md:hidden">
          <span className="font-display">Fan Dashboard</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
