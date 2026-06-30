import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { ThreadView } from "@/components/ThreadView";

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
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link href="/admin/messages" className="mb-4 text-sm text-accent hover:underline">
        ← Back to fan messages
      </Link>
      <h1 className="font-display text-xl">{messages[0].subject}</h1>
      <div className="mt-4 flex-1 overflow-hidden glass-card">
        <ThreadView
          threadId={threadId}
          messages={messages}
          isAdmin
          fanName={fan?.display_name}
          fanLastSeen={fan?.last_seen_at}
        />
      </div>
    </div>
  );
}
