"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "login" | "signup";

export default function AuthPanel({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [didRedirect, setDidRedirect] = useState(false);
  const appOrigin = "https://app.zmarty.me";
  const loginRedirectPath = `/login?next=${encodeURIComponent(nextPath)}`;

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!sessionEmail || didRedirect) return;
    setDidRedirect(true);
    router.replace(nextPath);
  }, [didRedirect, nextPath, router, sessionEmail]);

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase auth is not configured for this environment.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const credentials = { email: email.trim(), password };
    const response =
      mode === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: `${appOrigin}${loginRedirectPath}`,
            },
          });

    if (response.error) {
      setError(response.error.message);
    } else if (mode === "signup") {
      setMessage("Account created. Check your email for the confirmation link.");
    } else {
      setMessage("Login successful.");
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!supabase) {
      setError("Supabase auth is not configured for this environment.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appOrigin}${loginRedirectPath}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Signed out.");
    setError("");
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_420px] lg:gap-7">
      <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,21,37,0.92),rgba(10,15,29,0.82))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
          Member zone
        </div>

        <h1 className="mt-5 font-['Space_Grotesk'] text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl">
          Enter the protected Zmarty platform.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Public users can review the product first. After login, they land in the member environment where tiers,
          billing, API access, and upgrade actions stay visible inside the app instead of disappearing behind a generic profile screen.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Inside-app upgrades", "Pricing remains visible inside the account zone, so users can move from review to upgrade without losing context."],
            ["Protected API access", "Paid members and advanced users can move from member access into the data product from one controlled surface."],
            ["Member workflow", "Login, tier visibility, billing, and access state are handled as one flow instead of a fragmented stack."],
            ["Compliance-safe positioning", "Zmarty is a data and analysis platform. It does not execute trades or provide financial advice."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 w-full max-w-md overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-4 lg:mx-0 lg:max-w-none">
          <Image
            src="/zmarty-logo.png"
            alt="Zmarty neon logo artwork"
            width={512}
            height={768}
            className="h-auto w-full rounded-[22px]"
            priority
          />
        </div>
      </div>

      <aside className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,21,37,0.92),rgba(10,15,29,0.82))] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.38)] sm:p-6">
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 p-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              mode === "login" ? "bg-[#ff8c00] text-slate-950" : "text-slate-300"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              mode === "signup" ? "bg-[#ff8c00] text-slate-950" : "text-slate-300"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
              {mode === "login" ? "Continue to the real login." : "Create your member account."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {mode === "login"
                ? "Authentication, Google OAuth, pricing visibility, and billing are handled inside the live Zmarty app."
                : "Create the account here, then continue into the protected member area where pricing and upgrades stay visible inside the app."}
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-[#ff8c00]"
              placeholder="you@zmarty.me"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-[0.16em] text-slate-400">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-[#ff8c00]"
              placeholder={mode === "login" ? "Your password" : "Minimum 6 characters"}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#ff9d2f] to-[#ff7f11] px-5 py-4 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(255,140,0,0.26)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {mode === "login" ? "Sign in with email" : "Create account"}
          </button>

          <div className="flex items-center gap-3 py-1 text-[12px] uppercase tracking-[0.16em] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            or continue with
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:border-cyan-300/40 disabled:opacity-60"
          >
            Continue with Google
          </button>
        </form>

        {(message || error) && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-500/40 bg-rose-950/30 text-rose-200"
                : "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}

        {sessionEmail && (
          <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-4">
            <p className="text-sm text-emerald-200">Signed in as {sessionEmail}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link href={nextPath} className="rounded-full border border-cyan-400/30 px-3 py-2 text-center text-xs font-semibold text-cyan-100">
                Continue into the app
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-emerald-400/30 px-3 py-2 text-center text-xs font-semibold text-emerald-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">What happens next</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />Users authenticate in the live app.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />They land in the protected member area.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />Tiers stay visible inside the app, not only on the public site.</li>
            <li className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />Billing and API access are handled from the member flow.</li>
          </ul>
        </div>

        <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm leading-7 text-amber-50">
          Zmarty analyzes live market data and presents probabilities, risk context, liquidation maps, and technical interpretation.
          It does not give personalized trading instructions and does not execute trades.
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/pricing" className="text-cyan-300 hover:text-cyan-200">
            Review pricing first
          </Link>
          <Link href="/account?view=tiers" className="text-slate-200 hover:text-white">
            Open member tier zone
          </Link>
        </div>
      </aside>
    </section>
  );
}
