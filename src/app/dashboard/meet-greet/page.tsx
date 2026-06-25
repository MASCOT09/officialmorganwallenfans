import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export default async function DashboardMeetGreetPage() {
  const session = await requireAuth();
  const repo = getRepository();
  const regs = await repo.getUserMeetGreetRegistrations(session.id);
  const events = await Promise.all(
    regs.map(async (r) => ({
      reg: r,
      event: await repo.getMeetGreetById(r.event_id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Meet & Greet</h1>
        <p className="text-muted">Your event registrations.</p>
      </div>
      {events.length === 0 ? (
        <p className="text-muted">
          No registrations yet.{" "}
          <Link href="/meet-and-greet" className="text-accent hover:underline">
            Browse events
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map(({ reg, event }) => (
            <li key={reg.id} className="glass-card p-4">
              <p className="font-medium">{event?.title ?? "Unknown"}</p>
              <p className="text-xs text-muted">
                {reg.is_waitlist ? "Waitlist" : "Confirmed"} ·{" "}
                {new Date(reg.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
