"use client";

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
} from "lucide-react";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import type { SessionUser } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/membership", label: "Membership", icon: Crown },
  { href: "/dashboard/messages", label: "Fan Messages", icon: MessageSquare },
  { href: "/dashboard/meet-greet", label: "Meet & Greet", icon: Calendar },
  { href: "/dashboard/giveaways", label: "Giveaways", icon: Gift },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/contact", label: "Private DMs", icon: MessageCircle },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  user,
  unreadCount,
}: {
  user: SessionUser;
  unreadCount: number;
}) {
  const nav = NAV.map((item) =>
    item.label === "Notifications" ? { ...item, badge: unreadCount } : item,
  );

  return (
    <PortalSidebar
      portalLabel="Member Portal"
      userName={user.display_name}
      userRole={user.role}
      nav={nav}
    />
  );
}
