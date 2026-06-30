import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { ThreadView } from "@/components/ThreadView";

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
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link href="/dashboard/messages" className="mb-4 text-sm text-accent hover:underline">
        ← Back to messages
      </Link>
      <h1 className="font-display text-xl">{messages[0].subject}</h1>
      <div className="mt-4 flex-1 overflow-hidden glass-card">
        <ThreadView threadId={threadId} messages={messages} membershipStatus={session.membership_status} />
      </div>
    </div>
  );
}
