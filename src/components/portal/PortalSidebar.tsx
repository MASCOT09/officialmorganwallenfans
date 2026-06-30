"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

interface PortalSidebarProps {
  portalLabel: string;
  userName: string;
  userRole: string;
  nav: PortalNavItem[];
}

export function PortalSidebar({ portalLabel, userName, userRole, nav }: PortalSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const navContent = (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href || (href !== nav[0]?.href && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
              active
                ? "border border-accent/30 bg-accent/15 text-accent"
                : "text-muted hover:bg-card hover:text-foreground"
            } ${collapsed ? "justify-center px-2" : ""}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && badge !== undefined && badge > 0 && (
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
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-card-border bg-card p-2 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`portal-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-card-border bg-[#121810] transition-all lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[4.75rem]" : "w-64"}`}
      >
        <div className="flex items-center justify-between border-b border-card-border p-4">
          {!collapsed && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">{portalLabel}</p>
              <p className="mt-1 font-display text-lg leading-tight">{userName}</p>
              <p className="text-xs capitalize text-muted">{userRole}</p>
            </div>
          )}
          <div className={`flex items-center gap-1 ${collapsed ? "mx-auto" : ""}`}>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-lg p-2 text-muted transition-colors hover:bg-card hover:text-foreground lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {navContent}
      </aside>
    </>
  );
}
