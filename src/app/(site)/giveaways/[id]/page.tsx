import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function GiveawayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = getRepository();
  const giveaway = await repo.getGiveawayById(id);
  if (!giveaway || giveaway.status !== "active") notFound();

  const session = await getSession();
  const entered = session ? await repo.hasGiveawayEntry(id, session.id) : false;
  const canEnter = canEnterGiveaways(session);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/giveaways" className="text-sm text-accent hover:underline">
        ← Back to giveaways
      </Link>
      <h1 className="mt-6 font-display text-4xl">{giveaway.title}</h1>
      {giveaway.image_url && (
        <PostImage src={giveaway.image_url} alt={giveaway.title} className="mt-6 max-h-96 w-full object-cover" />
      )}
      <p className="mt-4 leading-relaxed text-muted">{giveaway.description}</p>
      {giveaway.ends_at && (
        <p className="mt-4 text-sm text-accent">
          Ends {new Date(giveaway.ends_at).toLocaleString()}
        </p>
      )}
      {entered ? (
        <p className="mt-8 text-secondary">You&apos;re entered! Good luck.</p>
      ) : (
        <div className="mt-8">
          <MembershipGateButton
            actionLabel="Enter this giveaway"
            requiredTier="silver"
            canParticipate={canEnter}
            isLoggedIn={!!session}
            redirectPath={`/giveaways/${id}`}
            className="btn-primary"
          >
            <form action={enterGiveaway}>
              <input type="hidden" name="giveawayId" value={id} />
              <FormSubmitButton label="Enter this giveaway" pendingLabel="Entering…" className="btn-primary" />
            </form>
          </MembershipGateButton>
        </div>
      )}
    </div>
  );
}
