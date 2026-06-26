"use client";

import { useActionState } from "react";
import { applyMembershipAction } from "@/actions/fan";
import { MEMBERSHIP_TIERS } from "@/lib/membership";
import type { MembershipTier } from "@/lib/types";

function TierCard({
  tier,
  current,
  status,
}: {
  tier: MembershipTier;
  current: MembershipTier;
  status: string;
}) {
  const info = MEMBERSHIP_TIERS[tier];
  const [state, action, pending] = useActionState(
    async () => applyMembershipAction(tier),
    { success: false },
  );

  const isCurrent = current === tier && status === "approved";
  const isPending = status === "pending";

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl">{info.label}</h3>
          {info.price > 0 && <p className="mt-1 text-2xl text-accent">${info.price}</p>}
        </div>
        <span className={`tier-badge tier-${tier}`}>{info.label}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-muted">
        {info.perks.map((p) => (
          <li key={p}>✓ {p}</li>
        ))}
      </ul>
      {tier !== "none" && !isCurrent && (
        <form action={action} className="mt-6">
          <button
            type="submit"
            disabled={pending || isPending}
            className="btn-primary w-full text-xs"
          >
            {isPending ? "Application pending" : pending ? "Applying…" : "Apply for membership"}
          </button>
          {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
        </form>
      )}
      {isCurrent && <p className="mt-6 text-sm text-secondary">Your current tier</p>}
    </div>
  );
}

export function MembershipClient({
  currentTier,
  status,
}: {
  currentTier: MembershipTier;
  status: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Membership</h1>
        <p className="text-muted">
          Apply for membership — after you apply, you&apos;ll be taken to the team inbox to choose how to pay (PayPal, Apple Gift Card, or Bitcoin).
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(["none", "silver", "gold", "platinum"] as MembershipTier[]).map((tier) => (
          <TierCard key={tier} tier={tier} current={currentTier} status={status} />
        ))}
      </div>
    </div>
  );
}
