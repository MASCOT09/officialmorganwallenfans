"use client";

import { useActionState } from "react";
import { MessageSquare } from "lucide-react";
import { createThreadAction } from "@/actions/fan";
import { EmptyState } from "@/components/EmptyState";
import { ImageUploadField } from "@/components/ImageUploadField";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { ThreadConversationCard } from "@/components/portal/ThreadConversationCard";
import type { MessageThread } from "@/lib/types";

export function MessagesClient({ threads }: { threads: MessageThread[] }) {
  const [state, action] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return createThreadAction(formData);
    },
    { success: false },
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Fan Messages</h1>
        <p className="mt-2 text-muted">
          Two-way inbox — chat with the Morgan Wallen Fan Team about membership, tickets, and more.
        </p>
      </div>

      <form action={action} encType="multipart/form-data" className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Start a new conversation</h2>
        <div>
          <label className="label-text">Subject</label>
          <input name="subject" placeholder="What is this about?" required className="input-field" />
        </div>
        <div>
          <label className="label-text">Your message</label>
          <textarea
            name="body"
            rows={4}
            placeholder="Write your message..."
            className="input-field resize-none"
          />
        </div>
        <ImageUploadField label="Attach image (optional)" />
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <FormSubmitButton label="Send message" pendingLabel="Sending…" />
      </form>

      <section className="glass-card p-6">
        <h2 className="font-display text-xl">Your conversations</h2>
        {threads.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description="Start a conversation with the Morgan Wallen Fan Team above."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {threads.map((t) => (
              <li key={t.thread_id}>
                <ThreadConversationCard
                  thread={t}
                  href={`/dashboard/messages/${t.thread_id}`}
                  variant="fan"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
