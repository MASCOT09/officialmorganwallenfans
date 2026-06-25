"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createThreadAction } from "@/actions/fan";
import { EmptyState } from "@/components/EmptyState";
import type { MessageThread } from "@/lib/types";

export function MessagesClient({ threads }: { threads: MessageThread[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return createThreadAction(formData);
    },
    { success: false },
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">My Messages</h1>
        <p className="text-muted">Chat with the Morgan Wallen Fan Team.</p>
      </div>

      <form action={action} className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Start a new conversation</h2>
        <input name="subject" placeholder="Subject" required className="input-field" />
        <textarea name="body" rows={4} placeholder="Your message..." required className="input-field resize-none" />
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-secondary">Message sent!</p>}
        <button type="submit" disabled={pending} className="btn-primary text-xs">
          {pending ? "Sending…" : "Send message"}
        </button>
      </form>

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Start a conversation with the Morgan Wallen Fan Team above."
        />
      ) : (
        <ul className="space-y-3">
          {threads.map((t) => (
            <li key={t.thread_id}>
              <Link
                href={`/dashboard/messages/${t.thread_id}`}
                className="glass-card flex items-center justify-between p-4 transition-colors hover:border-accent/30"
              >
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="mt-1 truncate text-sm text-muted">{t.last_message}</p>
                </div>
                {t.unread_count > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-background">
                    {t.unread_count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
