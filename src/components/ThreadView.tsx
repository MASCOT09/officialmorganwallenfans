"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyThreadAction } from "@/actions/fan";
import { adminReplyAction } from "@/actions/admin";
import type { Message } from "@/lib/types";
import { formatLastSeen } from "@/lib/membership";

interface ThreadViewProps {
  threadId: string;
  messages: Message[];
  isAdmin?: boolean;
  fanLastSeen?: string | null;
  fanName?: string;
}

export function ThreadView({
  threadId,
  messages,
  isAdmin = false,
  fanLastSeen,
  fanName,
}: ThreadViewProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    if (!body || pending) return;

    startTransition(async () => {
      const action = isAdmin ? adminReplyAction : replyThreadAction;
      await action(threadId, formData);
      form.reset();
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col">
      {isAdmin && fanName && (
        <div className="border-b border-card-border px-4 py-3 text-sm">
          <span className="font-medium">{fanName}</span>
          <span className="ml-3 text-muted">
            {formatLastSeen(fanLastSeen) === "Online now" ? (
              <span className="text-secondary">
                <span className="online-dot mr-1.5" />
                Online now
              </span>
            ) : (
              formatLastSeen(fanLastSeen)
            )}
          </span>
        </div>
      )}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.sender_role === "fan" ? "chat-bubble-fan" : "chat-bubble-admin"}
          >
            <p>{m.body}</p>
            <p className="mt-1 text-xs text-muted">
              {new Date(m.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-card-border p-4">
        <textarea
          name="body"
          rows={3}
          placeholder="Type your reply..."
          className="input-field resize-none"
          required
          disabled={pending}
        />
        <button type="submit" disabled={pending} className="btn-primary mt-3 text-xs">
          {pending ? "Sending…" : "Send reply"}
        </button>
      </form>
    </div>
  );
}
