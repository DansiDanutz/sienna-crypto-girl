"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, CreditCard, ShieldCheck, RefreshCw } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { TIER_CONFIG } from "@/lib/tiers";
import TransparencySection from "@/components/TransparencySection";
import SecurityAudit from "@/components/SecurityAudit";

interface MemberProfile {
  tier: "free" | "gold" | "premium";
  subscription_status: string;
  api_access_enabled: boolean;
  credits_balance: number;
  current_period_end: string | null;
}

interface ApiKeySummary {
  id: string;
  label: string;
  isActive: boolean;
  keyPreview: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

type AuthState = "unknown" | "authenticated" | "unauthenticated" | "misconfigured";

async function authorizedFetch(path: string, accessToken: string, init?: RequestInit) {
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
}

export default function AccountPanel({
  tiersOnly,
  requestedPlan,
  checkoutStatus,
}: {
  tiersOnly: boolean;
  requestedPlan: "gold" | "premium" | null;
  checkoutStatus: "success" | "cancelled" | null;
}) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>("unknown");

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const resetToSignedOutState = (messageText?: string) => {
    setAuthState("unauthenticated");
    setSessionEmail(null);
    setProfile(null);
    setApiKeys([]);
    setFreshKey(null);
    if (messageText) {
      setError(messageText);
    }
  };

  const withAccessToken = async <T,>(fn: (accessToken: string) => Promise<T>) => {
    if (!supabase) {
      setAuthState("misconfigured");
      throw new Error("Supabase auth is not configured.");
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setAuthState("unauthenticated");
      setSessionEmail(null);
      throw new Error("You must be logged in to manage your account.");
    }

    setAuthState("authenticated");
    setSessionEmail(session.user.email ?? null);
    return fn(session.access_token);
  };

  const loadAccount = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setFreshKey(null);
    if (!supabase) {
      setAuthState("misconfigured");
      setError("Supabase auth is not configured.");
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setAuthState("unauthenticated");
      setSessionEmail(null);
      setProfile(null);
      setApiKeys([]);
      setLoading(false);
      return;
    }

    setAuthState("authenticated");
    setSessionEmail(session.user.email ?? null);
    try {
      const [profileRes, keysRes] = await Promise.all([
        authorizedFetch("/api/member/profile", session.access_token),
        authorizedFetch("/api/member/api-key", session.access_token),
      ]);

      const [profileJson, keysJson] = await Promise.all([profileRes.json(), keysRes.json()]);

      if ([profileRes.status, keysRes.status].some((status) => status === 401 || status === 403)) {
        resetToSignedOutState("Your member session expired. Sign in again to continue.");
        return;
      }

      if (!profileRes.ok) throw new Error(profileJson.error ?? "Failed to load member profile.");
      if (!keysRes.ok) throw new Error(keysJson.error ?? "Failed to load API keys.");

      setProfile(profileJson.profile);
      setApiKeys(keysJson.keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionEmail(session?.user?.email ?? null);
      if (event === "SIGNED_OUT" || !session) {
        setAuthState("unauthenticated");
        setProfile(null);
        setApiKeys([]);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setAuthState("authenticated");
        void loadAccount();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const startCheckout = async (plan: "gold" | "premium") => {
    setError("");
    setMessage("");
    try {
      await withAccessToken(async (accessToken) => {
        const response = await authorizedFetch("/api/billing/checkout", accessToken, {
          method: "POST",
          body: JSON.stringify({ plan }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Failed to start checkout.");
        if (json.checkoutUrl) window.location.href = json.checkoutUrl;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
    }
  };

  const openPortal = async () => {
    setError("");
    setMessage("");
    try {
      await withAccessToken(async (accessToken) => {
        const response = await authorizedFetch("/api/billing/portal", accessToken, {
          method: "POST",
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Failed to open billing portal.");
        if (json.portalUrl) window.location.href = json.portalUrl;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal.");
    }
  };

  const createApiKey = async () => {
    setError("");
    setMessage("");
    setFreshKey(null);
    try {
      await withAccessToken(async (accessToken) => {
        const response = await authorizedFetch("/api/member/api-key", accessToken, {
          method: "POST",
          body: JSON.stringify({ label: "Primary API key" }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Failed to create API key.");

        setFreshKey(json.key.plainTextKey);
        setMessage("API key created. Copy it now; it will not be shown again.");
        await loadAccount();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key.");
    }
  };

  const revokeApiKey = async (keyId: string) => {
    setError("");
    setMessage("");
    try {
      await withAccessToken(async (accessToken) => {
        const response = await authorizedFetch("/api/member/api-key", accessToken, {
          method: "DELETE",
          body: JSON.stringify({ keyId }),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Failed to revoke API key.");

        setMessage("API key revoked.");
        await loadAccount();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key.");
    }
  };

  const currentTierConfig = profile ? TIER_CONFIG[profile.tier] : null;

  useEffect(() => {
    if (checkoutStatus === "success") {
      setMessage("Checkout completed. Refreshing account status…");
      loadAccount();
      return;
    }

    if (
      requestedPlan &&
      (requestedPlan === "gold" || requestedPlan === "premium") &&
      !loading &&
      profile &&
      profile.tier !== requestedPlan
    ) {
      startCheckout(requestedPlan);
    }
  }, [checkoutStatus, requestedPlan, loading, profile?.tier]);

  const showMemberControls = authState === "authenticated";
  const showSubscriptionPreview = showMemberControls || tiersOnly;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Member control</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Account, billing, and API access</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              This page is the production control surface for Zmarty members. Paid tiers activate API access,
              and Gold/Premium members can generate personal API keys for protected analytics endpoints.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAccount}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {(message || (error && authState !== "unauthenticated")) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-500/40 bg-rose-950/30 text-rose-200"
              : "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
          }`}
        >
          {error || message}
        </div>
      )}

      {freshKey && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-4 text-sm text-amber-100">
          <div className="font-semibold">Copy this API key now.</div>
          <div className="mt-2 break-all rounded-xl bg-slate-950/70 px-3 py-3 font-mono text-xs text-amber-50">
            {freshKey}
          </div>
        </div>
      )}

      {tiersOnly && (
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">Free members can continue into the app</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-100">
            You do not need to activate Gold or Premium to keep using your account. If you want to stay on the Free
            plan for now, continue into the member area and come back to upgrade later.
          </p>
          <div className="mt-4">
            <Link
              href="/account"
              className="inline-flex w-full justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-100 sm:w-auto"
            >
              Continue with Free
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white">Trust before upgrade</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">
          Zmarty is an analytics and intelligence platform. This account zone should make it obvious what users are
          buying, how access works, and what the platform does not do. Research, paper trading, and live execution are
          different states and should never blur together during onboarding.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Visible billing", "Users can see tier, credits, billing portal access, and API eligibility from one member surface."],
            ["Transparent access", "Gold and Premium unlock API access through personal keys instead of hidden or implied backend magic."],
            ["Execution boundaries", "Signals and analysis are visible, but the product does not pretend to silently execute trades or act like a broker."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="mt-2 text-xs leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {!loading && authState === "unauthenticated" && (
        <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">Sign in to continue into the member app</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-purple-100">
            Your pricing, billing, and upgrade controls stay inside the app. Sign in or create your account first,
            then continue directly into the Zmarty member area.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?next=%2Faccount%3Fview%3Dtiers"
              className="inline-flex justify-center rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-white"
            >
              Sign in or create account
            </Link>
            <Link
              href="/pricing"
              className="inline-flex justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white"
            >
              Review pricing again
            </Link>
          </div>
        </div>
      )}

      {!loading && authState === "misconfigured" && (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white">Member auth is not configured in this environment</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-100">
            This deployment can still show pricing and onboarding context, but login and member account controls need
            the `NEXT_PUBLIC_SUPABASE_*` browser auth variables before the protected flow can work end to end.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
            >
              Review pricing
            </Link>
            <a
              href="https://app.zmarty.me"
              className="inline-flex justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white"
            >
              Open live app
            </a>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-slate-300">
          Loading account, billing, and API access…
        </div>
      ) : (
        <>
          <TransparencySection />
          {showSubscriptionPreview ? (
          <div className={`grid gap-6 ${tiersOnly ? "max-w-3xl" : "lg:grid-cols-2"}`}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-cyan-300" />
                <h2 className="text-2xl font-bold text-white">Subscription</h2>
              </div>
              {tiersOnly && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-slate-300">
                    This is the dedicated membership zone. You can upgrade here, or continue as a Free member and
                    move into the rest of the member control panel without activating a paid tier yet.
                  </p>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100">
                    Free members can still continue into the app, keep their account, review billing state, and
                    return later to activate Gold or Premium.
                  </div>
                </div>
              )}
              <div className="mt-6 space-y-3 text-sm text-slate-200">
                <div>Email: {sessionEmail ?? (tiersOnly ? "Create account to activate" : "Sign in required")}</div>
                <div>Tier: {currentTierConfig?.label ?? "Free"}</div>
                <div>Status: {profile?.subscription_status ?? (tiersOnly ? "preview" : "inactive")}</div>
                <div>Credits: {profile?.credits_balance ?? 0}</div>
                <div>
                  Period end: {profile?.current_period_end ? new Date(profile.current_period_end).toLocaleString() : "n/a"}
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {tiersOnly && (
                  <Link
                    href="/account"
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-sm font-bold text-cyan-100"
                  >
                    Continue with Free
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => startCheckout("gold")}
                  className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950"
                >
                  Activate Gold
                </button>
                <button
                  type="button"
                  onClick={() => startCheckout("premium")}
                  className="rounded-2xl bg-purple-500 px-4 py-3 text-sm font-bold text-white"
                >
                  Activate Premium
                </button>
                <button
                  type="button"
                  onClick={openPortal}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white"
                >
                  Billing portal
                </button>
              </div>
            </div>

            {!tiersOnly && showMemberControls && (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <h2 className="text-2xl font-bold text-white">API access</h2>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-200">
                <div>Access enabled: {profile?.api_access_enabled ? "Yes" : "No"}</div>
                <div>Eligible tiers: Gold, Premium</div>
                <div>Authentication: personal API key</div>
                <div>Use case: analytics and intelligence access</div>
                <div>Header: <code className="rounded bg-slate-950/70 px-2 py-1">x-api-key</code></div>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={createApiKey}
                  disabled={!profile?.api_access_enabled}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  Generate API key
                </button>
                {!profile?.api_access_enabled && (
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    Upgrade to Gold or Premium first. API access stays off until the paid member tier is active.
                  </p>
                )}
              </div>
            </div>
            )}
          </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white">Member controls open after sign-in</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Billing history, API keys, tier status, and protected analytics access stay inside the signed-in member
                zone. Use the sign-in action above to continue into the full control panel.
              </p>
            </div>
          )}

          {!tiersOnly && showMemberControls && <SecurityAudit />}

          {!tiersOnly && showMemberControls && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Issued API keys</h2>
            <div className="mt-6 space-y-3">
              {apiKeys.length === 0 ? (
                <div className="text-sm text-slate-400">
                  No API keys issued yet. Generate one after Gold or Premium activation to use protected analytics
                  endpoints.
                </div>
              ) : (
                apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-200"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{key.label}</div>
                      <div className="font-mono text-xs text-slate-400">{key.keyPreview}</div>
                      <div className="text-xs text-slate-500">
                        Created {new Date(key.createdAt).toLocaleString()}
                        {key.lastUsedAt ? ` • Last used ${new Date(key.lastUsedAt).toLocaleString()}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => revokeApiKey(key.id)}
                      disabled={!key.isActive}
                      className="rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-50"
                    >
                      {key.isActive ? "Revoke" : "Revoked"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          )}
        </>
      )}
    </section>
  );
}
