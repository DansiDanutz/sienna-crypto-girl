"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import TradingDashboard from "@/components/TradingDashboard";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthState = "checking" | "authenticated" | "unauthenticated" | "misconfigured";

export default function DashboardAccess() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("checking");

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setAuthState("misconfigured");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.access_token) {
        setAuthState("authenticated");
        return;
      }

      setAuthState("unauthenticated");
      router.replace("/login?next=%2Fdashboard");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (session?.access_token) {
        setAuthState("authenticated");
        return;
      }

      setAuthState("unauthenticated");
      router.replace("/login?next=%2Fdashboard");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (authState === "authenticated") {
    return <TradingDashboard />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-white shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Dashboard access</p>
        <h1 className="mt-4 text-3xl font-black">Trading dashboard is member-gated</h1>
        {authState === "misconfigured" ? (
          <p className="mt-4 text-sm leading-6 text-slate-300">
            This environment is missing `NEXT_PUBLIC_SUPABASE_*` auth settings, so the protected dashboard route cannot
            verify a member session here.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Redirecting to sign-in so the dashboard can open inside an authenticated member session.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login?next=%2Fdashboard"
            className="inline-flex justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950"
          >
            Sign in
          </Link>
          <Link
            href="/account"
            className="inline-flex justify-center rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to account
          </Link>
        </div>
      </div>
    </main>
  );
}
