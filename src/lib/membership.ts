import type { MembershipTier, SessionUser } from "./types";

export const MEMBERSHIP_TIERS = {
  none: { label: "None", price: 0, perks: ["Browse only"] },
  silver: {
    label: "Silver",
    price: 100,
    perks: [
      "Giveaways",
      "Team messages",
      "Manager contact",
      "Push notifications",
      "Concert ticket purchase",
    ],
  },
  gold: {
    label: "Gold",
    price: 250,
    perks: [
      "All Silver perks",
      "Meet & greet registration",
    ],
  },
  platinum: {
    label: "Platinum",
    price: 500,
    perks: [
      "All Gold perks",
      "Direct Morgan Wallen contact",
    ],
  },
} as const;

export function tierRank(tier: MembershipTier): number {
  const ranks: Record<MembershipTier, number> = {
    none: 0,
    silver: 1,
    gold: 2,
    platinum: 3,
  };
  return ranks[tier];
}

export function hasActiveMembership(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.membership_status === "approved" && user.membership_tier !== "none";
}

export function canEnterGiveaways(user: SessionUser | null): boolean {
  return hasActiveMembership(user) && tierRank(user!.membership_tier) >= tierRank("silver");
}

export function canPurchaseTickets(user: SessionUser | null): boolean {
  return hasActiveMembership(user) && tierRank(user!.membership_tier) >= tierRank("silver");
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function canRegisterMeetAndGreet(user: SessionUser | null): boolean {
  return hasActiveMembership(user) && tierRank(user!.membership_tier) >= tierRank("gold");
}

export function canContactManagement(user: SessionUser | null): boolean {
  return hasActiveMembership(user) && tierRank(user!.membership_tier) >= tierRank("silver");
}

export function canContactArtist(user: SessionUser | null): boolean {
  return hasActiveMembership(user) && user!.membership_tier === "platinum";
}

export function formatLastSeen(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "Never online";
  const last = new Date(lastSeenAt).getTime();
  const now = Date.now();
  const diffMs = now - last;
  const fiveMin = 5 * 60 * 1000;
  if (diffMs < fiveMin) return "Online now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `Last online ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last online ${hours}h ago`;
  return `Last online ${new Date(lastSeenAt).toLocaleDateString()}`;
}

export const SITE_NAME = "Morgan Wallen";
export const TEAM_NAME = "Morgan Wallen Fan Team";
export const MANAGER_TEAM = "Morgan Wallen Manager Team";
