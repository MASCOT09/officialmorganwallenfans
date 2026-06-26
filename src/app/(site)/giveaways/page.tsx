import Link from "next/link";
import { getRepository } from "@/lib/repository";
import { getSession } from "@/lib/auth";
import { canEnterGiveaways } from "@/lib/membership";
import { enterGiveawayAction } from "@/actions/fan";
import { MembershipGateButton } from "@/components/MembershipGateButton";
import { PostImage } from "@/components/PostImage";
import { FormSubmitButton } from "@/components/FormSubmitButton";

async function enterGiveaway(formData: FormData) {
  "use server";
  const id = String(formData.get("giveawayId") ?? "");
  if (id) await enterGiveawayAction(id);
}

export const metadata = { title: "Giveaways" };

export default async function GiveawaysPage() {
  const repo = getRepository();
  const session = await getSession();
  const giveaways = await repo.getGiveaways("active");
  const canEnter = canEnterGiveaways(session);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl">Giveaways</h1>
      <p className="mt-2 text-muted">Browse exclusive Morgan Wallen fan giveaways.</p>

      {giveaways.length === 0 ? (
        <p className="mt-12 text-muted">No active giveaways right now. Check back soon!</p>
      ) : (
        <div className="mt-10 grid gap-6">
          {giveaways.map((g) => (
            <div key={g.id} className="glass-card p-6">
              {g.image_url && <PostImage src={g.image_url} alt={g.title} className="mb-4 max-h-48 w-full object-cover" />}
              <h2 className="font-display text-xl">{g.title}</h2>
              <p className="mt-2 text-sm text-muted">{g.description}</p>
              {g.ends_at && (
                <p className="mt-2 text-xs text-accent">
                  Ends {new Date(g.ends_at).toLocaleDateString()}
                </p>
              )}
              <div className="mt-4 flex gap-3">
                <Link href={`/giveaways/${g.id}`} className="btn-secondary text-xs">
                  Details
                </Link>
                <MembershipGateButton
                  actionLabel="Enter giveaway"
                  requiredTier="silver"
                  canParticipate={canEnter}
                  isLoggedIn={!!session}
                  redirectPath="/giveaways"
                >
                  <form action={enterGiveaway}>
                    <input type="hidden" name="giveawayId" value={g.id} />
                    <FormSubmitButton label="Enter giveaway" pendingLabel="Entering…" />
                  </form>
                </MembershipGateButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
