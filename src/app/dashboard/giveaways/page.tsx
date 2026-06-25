import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export default async function DashboardGiveawaysPage() {
  const session = await requireAuth();
  const repo = getRepository();
  const entries = await repo.getUserGiveawayEntries(session.id);
  const giveaways = await Promise.all(
    entries.map(async (e) => ({
      entry: e,
      giveaway: await repo.getGiveawayById(e.giveaway_id),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">My Giveaways</h1>
        <p className="text-muted">Your Morgan Wallen giveaway entries.</p>
      </div>
      {giveaways.length === 0 ? (
        <p className="text-muted">
          No entries yet.{" "}
          <Link href="/giveaways" className="text-accent hover:underline">
            Browse giveaways
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {giveaways.map(({ entry, giveaway }) => (
            <li key={entry.id} className="glass-card p-4">
              <p className="font-medium">{giveaway?.title ?? "Unknown"}</p>
              <p className="text-xs text-muted">
                Entered {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
