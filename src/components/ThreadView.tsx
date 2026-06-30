"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyThreadAction } from "@/actions/fan";
import { adminReplyAction } from "@/actions/admin";
import type { Message } from "@/lib/types";
import { formatLastSeen, TEAM_NAME } from "@/lib/membership";
import { getActivePaymentOptions, visibleMessageBody } from "@/lib/payment-inbox-shared";
import { isWelcomeThreadSubject } from "@/lib/welcome-message";
import { ImageUploadField } from "@/components/ImageUploadField";
import { PostImageGallery } from "@/components/PostImageGallery";
import { PaymentOptionsButtons } from "@/components/PaymentOptionsButtons";
import { WelcomeMembershipPlans } from "@/components/WelcomeMembershipPlans";
import type { MembershipStatus } from "@/lib/types";

interface ThreadViewProps {
  threadId: string;
  messages: Message[];
  isAdmin?: boolean;
  fanLastSeen?: string | null;
  fanName?: string;
  membershipStatus?: MembershipStatus;
}

export function ThreadView({
  threadId,
  messages,
  isAdmin = false,
  fanLastSeen,
  fanName,
  membershipStatus = "none",
}: ThreadViewProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const activePaymentOptions = !isAdmin ? getActivePaymentOptions(messages) : null;
  const showWelcomePlans =
    !isAdmin && messages.length > 0 && isWelcomeThreadSubject(messages[0].subject);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();
    const hasImage = formData
      .getAll("images")
      .some((item) => item instanceof File && item.size > 0);
    if ((!body && !hasImage) || pending) return;

    setError(null);
    startTransition(async () => {
      const action = isAdmin ? adminReplyAction : replyThreadAction;
      const result = await action(threadId, formData);
      if (result && "success" in result && !result.success) {
        setError(result.error ?? "Failed to send message.");
        return;
      }
      form.reset();
      router.refresh();
    });
  }

  const showFanHeader = isAdmin && !!fanName;

  return (
    <div
      className={`grid h-full min-h-0 ${
        showFanHeader ? "grid-rows-[auto_minmax(0,1fr)_auto]" : "grid-rows-[minmax(0,1fr)_auto]"
      }`}
    >
      {showFanHeader && (
        <div className="border-b border-card-border px-4 py-2.5 text-sm">
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

      <div className="thread-messages">
        <div className="space-y-4 pb-2">
          {messages.map((m) => {
            const text = visibleMessageBody(m.body);
            const senderLabel = m.sender_role === "admin" ? TEAM_NAME : fanName ?? "You";
            return (
              <div
                key={m.id}
                className={m.sender_role === "fan" ? "chat-bubble-fan" : "chat-bubble-admin"}
              >
                <p className="mb-1 text-xs font-medium text-muted">{senderLabel}</p>
                {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
                <PostImageGallery
                  entity={m}
                  alt="Message attachment"
                  className="max-h-48 w-full object-cover"
                />
                <p className="mt-1 text-xs text-muted">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
          {activePaymentOptions && (
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm text-muted">Choose your payment method:</p>
              <PaymentOptionsButtons threadId={threadId} />
            </div>
          )}
          {showWelcomePlans && (
            <WelcomeMembershipPlans membershipStatus={membershipStatus} />
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="thread-compose"
      >
        {isAdmin && (
          <div>
            <label className="label-text">From name</label>
            <input
              type="text"
              readOnly
              value={TEAM_NAME}
              className="input-field bg-card/80 py-2 text-sm"
            />
          </div>
        )}
        <div>
          <label className="label-text">Your reply</label>
          <textarea
            name="body"
            rows={2}
            placeholder="Write your message..."
            className="input-field resize-none py-2"
            disabled={pending}
          />
        </div>
        <ImageUploadField label="Attach image (optional)" compact />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary text-xs">
          {pending ? "Sending…" : "Send reply"}
        </button>
      </form>
    </div>
  );
}
