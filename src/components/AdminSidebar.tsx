"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  Calendar,
  Ticket,
  MessageSquare,
  Crown,
  Users,
  Phone,
  MousePointer,
  Settings,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/giveaways", label: "Giveaways", icon: Gift },
  { href: "/admin/meet-greet", label: "Meet & Greet", icon: Calendar },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/messages", label: "Fan Messages", icon: MessageSquare },
  { href: "/admin/memberships", label: "Memberships", icon: Crown },
  { href: "/admin/communities", label: "Communities", icon: Users },
  { href: "/admin/contact-links", label: "Contact Links", icon: Phone },
  { href: "/admin/buttons", label: "Button Links", icon: MousePointer },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/team", label: "Team & Admins", icon: UserCog },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-card-border bg-card p-2 lg:hidden"
        aria-label="Open admin menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-card-border bg-background transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-card-border p-4 lg:hidden">
          <span className="font-display text-sm">Admin Panel</span>
          <button onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden border-b border-card-border p-4 lg:block">
          <p className="text-xs uppercase tracking-widest text-accent">Admin</p>
          <p className="font-display text-lg">Morgan Wallen</p>
        </div>
        {nav}
      </aside>
    </>
  );
}
