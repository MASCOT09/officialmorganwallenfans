"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/actions/fan";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import type { Notification } from "@/lib/types";

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();

  useEffect(() => {
    markAllNotificationsReadAction().then(() => router.refresh());
  }, [router]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Notifications</h1>
        <p className="text-muted">Alerts from the Morgan Wallen fan community.</p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! New alerts will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="glass-card p-4">
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              <p className="mt-2 text-xs text-muted">{new Date(n.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
