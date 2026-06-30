"use client";

import { useActionState } from "react";
import { applyMembershipAction } from "@/actions/fan";
import { MEMBERSHIP_TIERS } from "@/lib/membership";
import type { MembershipTier } from "@/lib/types";

const PAID_TIERS: MembershipTier[] = ["silver", "gold", "platinum"];

function TierApplyCard({
  tier,
  status,
}: {
  tier: MembershipTier;
  status: string;
}) {
  const info = MEMBERSHIP_TIERS[tier];
  const [state, action, pending] = useActionState(
    async () => applyMembershipAction(tier),
    { success: false },
  );
  const isPending = status === "pending";

  return (
    <div className="rounded-xl border border-card-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg">{info.label}</p>
          <p className="mt-1 text-xl text-accent">${info.price}</p>
        </div>
        <span className={`tier-badge tier-${tier}`}>{info.label}</span>
      </div>
      <ul className="mt-3 space-y-1 text-xs text-muted">
        {info.perks.map((perk) => (
          <li key={perk}>✓ {perk}</li>
        ))}
      </ul>
      <form action={action} className="mt-4">
        <button
          type="submit"
          disabled={pending || isPending}
          className="btn-primary w-full text-xs"
        >
          {isPending ? "Application pending" : pending ? "Applying…" : `Apply for ${info.label}`}
        </button>
        {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      </form>
    </div>
  );
}

interface WelcomeMembershipPlansProps {
  membershipStatus: string;
}

export function WelcomeMembershipPlans({ membershipStatus }: WelcomeMembershipPlansProps) {
  if (membershipStatus === "approved" || membershipStatus === "pending") return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
      <p className="text-sm font-medium">Choose your membership plan</p>
      <p className="mt-1 text-xs text-muted">
        Apply below to unlock giveaways, meet & greets, and direct team access.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PAID_TIERS.map((tier) => (
          <TierApplyCard key={tier} tier={tier} status={membershipStatus} />
        ))}
      </div>
    </div>
  );
}
