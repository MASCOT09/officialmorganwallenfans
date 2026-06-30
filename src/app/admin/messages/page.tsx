import { getRepository } from "@/lib/repository";
import { AdminComposeForm } from "@/components/admin/AdminComposeForm";
import { ThreadConversationCard } from "@/components/portal/ThreadConversationCard";

export default async function AdminMessagesPage() {
  const repo = getRepository();
  const threads = await repo.getAllThreads();
  const fans = await repo.getFansForMessaging();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Fan Messages</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Two-way inbox — reply to fan membership requests and send announcements.
        </p>
      </div>

      <section className="glass-card p-6">
        <h2 className="font-display text-2xl">Fan conversations</h2>
        <p className="mt-2 text-sm text-muted">
          Fans can message you about membership plans. Open a thread to reply, then set their badge
          under Team &amp; Admins.
        </p>

        {threads.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No fan conversations yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {threads.map((t) => (
              <li key={t.thread_id}>
                <ThreadConversationCard
                  thread={t}
                  href={`/admin/messages/${t.thread_id}`}
                  variant="admin"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminComposeForm fans={fans} />
    </div>
  );
}
