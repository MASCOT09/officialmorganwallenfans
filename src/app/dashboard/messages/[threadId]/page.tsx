import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { ThreadView } from "@/components/ThreadView";
import { ThreadPageFrame } from "@/components/portal/ThreadPageFrame";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const session = await requireAuth();
  const repo = getRepository();
  const messages = await repo.getMessagesByThread(threadId);

  if (messages.length === 0 || messages[0].user_id !== session.id) {
    return <p className="text-muted">Thread not found.</p>;
  }

  await repo.markThreadRead(threadId, "fan");

  return (
    <ThreadPageFrame
      backHref="/dashboard/messages"
      backLabel="← Back to messages"
      subject={messages[0].subject}
    >
      <ThreadView
        threadId={threadId}
        messages={messages}
        membershipStatus={session.membership_status}
        fanName={session.display_name}
      />
    </ThreadPageFrame>
  );
}
