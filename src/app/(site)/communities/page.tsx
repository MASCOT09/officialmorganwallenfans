import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canEnterGiveaways } from "@/lib/membership";
import { MembershipGateButton } from "@/components/MembershipGateButton";

export const metadata = { title: "Communities" };

export default async function CommunitiesPage() {
  const repo = getRepository();
  const session = await getSession();
  const communities = await repo.getCommunities();
  const canJoin = canEnterGiveaways(session);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl">Communities</h1>
      <p className="mt-2 text-muted">Browse Morgan Wallen fan groups across social platforms.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {communities.map((c) => (
          <div key={c.id} className="glass-card p-6">
            <p className="text-xs uppercase tracking-wider text-accent">{c.platform}</p>
            <h2 className="mt-2 font-display text-xl">{c.name}</h2>
            <p className="mt-2 text-sm text-muted">{c.description}</p>
            <div className="mt-4">
              <MembershipGateButton
                actionLabel="Join community"
                requiredTier="silver"
                canParticipate={canJoin}
                isLoggedIn={!!session}
                redirectPath="/communities"
              >
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex text-xs"
                >
                  Join community
                </a>
              </MembershipGateButton>
            </div>
          </div>
        ))}
      </div>

      {communities.length === 0 && (
        <p className="mt-12 text-muted">Communities coming soon.</p>
      )}
    </div>
  );
}
