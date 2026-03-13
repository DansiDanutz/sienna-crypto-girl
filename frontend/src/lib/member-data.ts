import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { apiAccessEnabledFor, normalizeTier, type MemberTier, type SubscriptionStatus, TIER_CONFIG } from "@/lib/tiers";

export interface MemberProfileRecord {
  user_id: string;
  email: string;
  tier: MemberTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  api_access_enabled: boolean;
  credits_balance: number;
  current_period_end: string | null;
}

export interface MemberApiKeyRecord {
  id: string;
  user_id: string;
  label: string;
  key_prefix: string;
  key_hash: string;
  is_active: boolean;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export async function ensureMemberProfile(userId: string, email: string) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return existing as MemberProfileRecord;
  }

  const defaultProfile: MemberProfileRecord = {
    user_id: userId,
    email,
    tier: "free",
    subscription_status: "inactive",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    api_access_enabled: false,
    credits_balance: TIER_CONFIG.free.credits,
    current_period_end: null,
  };

  const { data, error } = await supabase
    .from("member_profiles")
    .upsert(defaultProfile, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as MemberProfileRecord;
}

export async function listMemberApiKeys(userId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as MemberApiKeyRecord[];
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function generateApiKey() {
  const secret = crypto.randomBytes(24).toString("hex");
  const apiKey = `zm_${secret}`;
  const keyPrefix = apiKey.slice(0, 10);
  return {
    apiKey,
    keyPrefix,
    keyHash: hashApiKey(apiKey),
  };
}

export async function createMemberApiKey(userId: string, label: string) {
  const supabase = getSupabaseAdminClient();
  const generated = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: userId,
      label,
      key_prefix: generated.keyPrefix,
      key_hash: generated.keyHash,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    record: data as MemberApiKeyRecord,
    plainTextKey: generated.apiKey,
  };
}

export async function revokeMemberApiKey(userId: string, keyId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("api_keys")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", keyId);

  if (error) {
    throw error;
  }
}

export async function updateMemberSubscription(input: {
  userId: string;
  email?: string | null;
  tier: MemberTier;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const tier = normalizeTier(input.tier);
  const subscriptionStatus = input.subscriptionStatus;

  const payload = {
    user_id: input.userId,
    email: input.email ?? null,
    tier,
    subscription_status: subscriptionStatus,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    stripe_price_id: input.stripePriceId ?? null,
    api_access_enabled: apiAccessEnabledFor(tier, subscriptionStatus),
    credits_balance: TIER_CONFIG[tier].credits,
    current_period_end: input.currentPeriodEnd ?? null,
  };

  const { data, error } = await supabase
    .from("member_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as MemberProfileRecord;
}
