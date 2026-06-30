"use client";

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
} from "lucide-react";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import type { SessionUser } from "@/lib/types";

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

export function AdminSidebar({ user }: { user: SessionUser }) {
  return (
    <PortalSidebar
      portalLabel="Admin Panel"
      userName={user.display_name}
      userRole="admin"
      nav={NAV}
    />
  );
}
