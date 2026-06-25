import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { formatLastSeen } from "@/lib/membership";
import { adminComposeAction } from "@/actions/admin";

export default async function AdminMessagesPage() {
  const repo = getRepository();
  const threads = await repo.getAllThreads();
  const fans = await repo.getFansForMessaging();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Fan Messages</h1>

      <form action={adminComposeAction} className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg">Compose message</h2>
        <select name="fan_id" className="input-field">
          <option value="">Select a fan</option>
          {fans.map((f) => (
            <option key={f.id} value={f.id}>{f.display_name} ({f.email})</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="broadcast" /> Broadcast to all fans
        </label>
        <input name="subject" placeholder="Subject" required className="input-field" />
        <textarea name="body" placeholder="Message" required className="input-field" rows={4} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notify" defaultChecked /> Send notification
        </label>
        <button type="submit" className="btn-primary text-xs">Send</button>
      </form>

      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.thread_id}>
            <Link
              href={`/admin/messages/${t.thread_id}`}
              className="glass-card flex items-center justify-between p-4 hover:border-accent/30"
            >
              <div>
                <p className="font-medium">{t.fan_display_name ?? "Fan"} — {t.subject}</p>
                <p className="text-xs text-muted">
                  {formatLastSeen(t.fan_last_seen_at)}
                </p>
              </div>
              {t.unread_count > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-background">
                  {t.unread_count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
