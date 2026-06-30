import Link from "next/link";
import {
  formatLastSeen,
  isUserOnline,
  membershipDisplayLabel,
} from "@/lib/membership";
import { threadMessagePreview } from "@/lib/thread-preview";
import type { MessageThread } from "@/lib/types";

function formatThreadDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ThreadConversationCardProps {
  thread: MessageThread;
  href: string;
  variant?: "fan" | "admin";
}

export function ThreadConversationCard({
  thread,
  href,
  variant = "fan",
}: ThreadConversationCardProps) {
  const online = isUserOnline(thread.fan_last_seen_at);
  const membershipLabel =
    variant === "admin"
      ? membershipDisplayLabel(
          thread.fan_membership_tier ?? "none",
          thread.fan_membership_status ?? "none",
        )
      : null;

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-card-border bg-[#151c12]/60 p-5 transition-colors hover:border-accent/35"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {variant === "admin" ? (
            <>
              <p className="font-medium">{thread.fan_display_name ?? "Fan"}</p>
              {thread.fan_email && (
                <p className="mt-0.5 text-xs text-muted">{thread.fan_email}</p>
              )}
            </>
          ) : (
            <p className="font-medium">{thread.subject}</p>
          )}
        </div>
        <div className="text-right text-xs text-muted">
          <p>{formatThreadDate(thread.last_message_at)}</p>
          {membershipLabel && <p className="mt-1">{membershipLabel}</p>}
        </div>
      </div>

      {variant === "admin" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className={`inline-block h-2 w-2 rounded-full ${online ? "bg-accent" : "bg-muted/50"}`} />
          {formatLastSeen(thread.fan_last_seen_at)}
        </div>
      )}

      {variant === "admin" && (
        <p className="mt-3 font-display text-base">{thread.subject}</p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-muted">
        {threadMessagePreview(thread.last_message)}
      </p>

      {thread.unread_count > 0 && (
        <span className="mt-4 inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-background">
          {thread.unread_count} new
        </span>
      )}
    </Link>
  );
}
