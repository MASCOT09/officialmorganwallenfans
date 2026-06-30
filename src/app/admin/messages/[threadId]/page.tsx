import { requireAdmin } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { ThreadView } from "@/components/ThreadView";
import { ThreadPageFrame } from "@/components/portal/ThreadPageFrame";

export default async function AdminThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  await requireAdmin();
  const { threadId } = await params;
  const repo = getRepository();
  const messages = await repo.getMessagesByThread(threadId);
  if (messages.length === 0) return <p>Thread not found.</p>;

  const fan = await repo.getUserById(messages[0].user_id);
  await repo.markThreadRead(threadId, "admin");

  return (
    <ThreadPageFrame
      backHref="/admin/messages"
      backLabel="← Back to fan messages"
      subject={messages[0].subject}
    >
      <ThreadView
        threadId={threadId}
        messages={messages}
        isAdmin
        fanName={fan?.display_name}
        fanLastSeen={fan?.last_seen_at}
      />
    </ThreadPageFrame>
  );
}
