import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export default async function DashboardHomePage() {
  const session = await requireAuth();
  const repo = getRepository();
  const stats = await repo.getFanStats(session.id);
  const threads = await repo.getThreadsForUser(session.id);
  const notifications = (await repo.getNotifications(session.id)).slice(0, 5);
  const giveaways = (await repo.getGiveaways("active")).slice(0, 3);
  const events = (await repo.getMeetGreets("upcoming")).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-muted">Your Morgan Wallen fan hub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Messages", value: stats.total_messages, href: "/dashboard/messages" },
          { label: "Giveaway entries", value: stats.giveaway_entries, href: "/dashboard/giveaways" },
          { label: "Meet & greet", value: stats.meet_greet_requests, href: "/dashboard/meet-greet" },
          { label: "Ticket orders", value: stats.ticket_orders, href: "/dashboard/tickets" },
          { label: "Notifications", value: stats.unread_notifications, href: "/dashboard/notifications" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="glass-card p-5 transition-colors hover:border-accent/30">
            <p className="text-xs uppercase tracking-wider text-muted">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-accent">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <h2 className="font-display text-xl">Recent messages</h2>
          {threads.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No messages yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {threads.slice(0, 5).map((t) => (
                <li key={t.thread_id}>
                  <Link href={`/dashboard/messages/${t.thread_id}`} className="block text-sm hover:text-accent">
                    {t.subject}
                    {t.unread_count > 0 && (
                      <span className="ml-2 text-accent">({t.unread_count} new)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card p-6">
          <h2 className="font-display text-xl">Recent notifications</h2>
          {notifications.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All caught up!</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="text-sm">
                  <span className={n.is_read ? "text-muted" : "text-foreground font-medium"}>
                    {n.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <h2 className="font-display text-xl">Active giveaways</h2>
          {giveaways.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No active giveaways.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {giveaways.map((g) => (
                <li key={g.id}>
                  <Link href={`/giveaways/${g.id}`} className="text-sm hover:text-accent">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card p-6">
          <h2 className="font-display text-xl">Upcoming events</h2>
          {events.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No upcoming events.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {events.map((e) => (
                <li key={e.id}>
                  <Link href={`/meet-and-greet/${e.id}`} className="text-sm hover:text-accent">
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
