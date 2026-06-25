"use client";

import { useState } from "react";
import Link from "next/link";
import { MEMBERSHIP_TIERS } from "@/lib/membership";
import type { MembershipTier } from "@/lib/types";

const PAID_TIERS: MembershipTier[] = ["silver", "gold", "platinum"];

interface MembershipGateButtonProps {
  actionLabel: string;
  requiredTier: MembershipTier;
  canParticipate: boolean;
  isLoggedIn: boolean;
  redirectPath?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MembershipGateButton({
  actionLabel,
  requiredTier,
  canParticipate,
  isLoggedIn,
  redirectPath,
  className = "btn-primary text-xs",
  children,
}: MembershipGateButtonProps) {
  const [open, setOpen] = useState(false);
  const required = MEMBERSHIP_TIERS[requiredTier];

  if (canParticipate && children) {
    return <>{children}</>;
  }

  const signupHref = redirectPath
    ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
    : "/signup";
  const loginHref = redirectPath
    ? `/login?redirect=${encodeURIComponent(redirectPath)}`
    : "/login";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {actionLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-2xl">Membership required</h2>
            <p className="mt-2 text-sm text-muted">
              To <span className="text-foreground">{actionLabel.toLowerCase()}</span>, you need{" "}
              <span className="text-accent">{required.label}</span> membership or higher.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {PAID_TIERS.map((tier) => {
                const info = MEMBERSHIP_TIERS[tier];
                const highlight = tier === requiredTier;

                return (
                  <div
                    key={tier}
                    className={`rounded-xl border p-4 ${
                      highlight ? "border-accent bg-accent/10" : "border-card-border"
                    }`}
                  >
                    <p className="font-display text-lg">{info.label}</p>
                    <p className="mt-1 text-xl text-accent">${info.price}</p>
                    <ul className="mt-3 space-y-1 text-xs text-muted">
                      {info.perks.slice(0, 4).map((p) => (
                        <li key={p}>✓ {p}</li>
                      ))}
                    </ul>
                    {tier === requiredTier && (
                      <p className="mt-2 text-xs font-medium text-accent">Required tier</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard/membership" className="btn-primary text-xs">
                  Apply for membership
                </Link>
              ) : (
                <>
                  <Link href={signupHref} className="btn-primary text-xs">
                    Sign up
                  </Link>
                  <Link href={loginHref} className="btn-secondary text-xs">
                    Log in
                  </Link>
                </>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
