import { MEMBERSHIP_TIERS, TEAM_NAME } from "./membership";
import type { MembershipTier } from "./types";

export const WELCOME_THREAD_SUBJECT = `Welcome to the ${TEAM_NAME}!`;

const PAID_TIERS: MembershipTier[] = ["silver", "gold", "platinum"];

export function isWelcomeThreadSubject(subject: string): boolean {
  return subject === WELCOME_THREAD_SUBJECT;
}

export function buildSignupWelcomeMessage(displayName: string): string {
  const tierLines = PAID_TIERS.map((tier) => {
    const info = MEMBERSHIP_TIERS[tier];
    const perks = info.perks.join(", ");
    return `${info.label} — $${info.price}\n  ${perks}`;
  }).join("\n\n");

  return `Hey ${displayName}!

Welcome to the official Morgan Wallen fan community. We're glad you're here.

Your free account is active — you can browse tickets, explore giveaways, and message our team anytime. To unlock full member benefits, choose a membership plan below:

${tierLines}

Select a plan to apply. After you apply, we'll guide you through payment in this inbox (PayPal, Apple Gift Card, or Bitcoin).

You can also reply here if you have any questions. We're happy to help!`;
}
