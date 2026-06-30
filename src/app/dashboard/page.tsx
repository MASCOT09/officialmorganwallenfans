import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import {
  MessageSquare,
  Calendar,
  Gift,
  Ticket,
  Bell,
} from "lucide-react";
import { StatCard } from "@/components/portal/StatCard";

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
      <section>
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Member dashboard</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Welcome back, {session.display_name} 👋
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Your private fan hub — track entries, events, and profile. Signed in as{" "}
          <span className="text-foreground">{session.email}</span>.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total messages"
          value={stats.total_messages}
          href="/dashboard/messages"
          icon={MessageSquare}
        />
        <StatCard
          label="Meet & greet requests"
          value={stats.meet_greet_requests}
          href="/dashboard/meet-greet"
          icon={Calendar}
        />
        <StatCard
          label="Giveaway entries"
          value={stats.giveaway_entries}
          href="/dashboard/giveaways"
          icon={Gift}
        />
        <StatCard
          label="Ticket orders"
          value={stats.ticket_orders}
          href="/dashboard/tickets"
          icon={Ticket}
        />
        <StatCard
          label="Notifications"
          value={stats.unread_notifications}
          href="/dashboard/notifications"
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Recent messages</h2>
            <Link href="/dashboard/messages" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {threads.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No messages yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {threads.slice(0, 5).map((t) => (
                <li key={t.thread_id}>
                  <Link
                    href={`/dashboard/messages/${t.thread_id}`}
                    className="block rounded-xl border border-card-border px-4 py-3 text-sm transition-colors hover:border-accent/30"
                  >
                    <p className="font-medium">{t.subject}</p>
                    {t.unread_count > 0 && (
                      <p className="mt-1 text-xs text-accent">{t.unread_count} new</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Recent notifications</h2>
            <Link href="/dashboard/notifications" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="mt-4 text-sm text-muted">All caught up!</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="text-sm">
                  <span className={n.is_read ? "text-muted" : "font-medium text-foreground"}>
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
