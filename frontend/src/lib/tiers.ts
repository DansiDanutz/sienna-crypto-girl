export type PaidTier = "gold" | "premium";
export type MemberTier = "free" | PaidTier;
export type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid";

export interface TierConfig {
  id: MemberTier;
  label: string;
  monthlyPrice: number;
  apiAccess: boolean;
  credits: number;
}

export const TIER_CONFIG: Record<MemberTier, TierConfig> = {
  free: {
    id: "free",
    label: "Free",
    monthlyPrice: 0,
    apiAccess: false,
    credits: 100,
  },
  gold: {
    id: "gold",
    label: "Gold",
    monthlyPrice: 19,
    apiAccess: true,
    credits: 500,
  },
  premium: {
    id: "premium",
    label: "Premium",
    monthlyPrice: 50,
    apiAccess: true,
    credits: 1500,
  },
};

export function isPaidTier(value: string): value is PaidTier {
  return value === "gold" || value === "premium";
}

export function normalizeTier(value: string | null | undefined): MemberTier {
  if (value === "gold" || value === "premium") return value;
  return "free";
}

export function apiAccessEnabledFor(tier: MemberTier, status: SubscriptionStatus): boolean {
  if (tier === "free") return false;
  return status === "active" || status === "trialing";
}

export function stripePriceIdForTier(tier: PaidTier): string | null {
  if (tier === "gold") return process.env.STRIPE_GOLD_PRICE_ID ?? null;
  if (tier === "premium") return process.env.STRIPE_PREMIUM_PRICE_ID ?? null;
  return null;
}

export function tierForStripePriceId(priceId: string | null | undefined): MemberTier {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_GOLD_PRICE_ID) return "gold";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "premium";
  return "free";
}
