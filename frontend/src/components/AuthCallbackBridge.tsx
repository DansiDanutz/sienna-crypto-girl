"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function readHashError(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const error = params.get("error");
  const description = params.get("error_description");
  if (!error) return null;
  return description ? `${error}: ${description}` : error;
}

export default function AuthCallbackBridge({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign-in...");

  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setStatus("Supabase auth is not configured.");
      return;
    }

    let cancelled = false;
    const hash = window.location.hash || "";
    const authError = readHashError(hash);

    const finish = async () => {
      const startedAt = Date.now();

      while (!cancelled && Date.now() - startedAt < 12000) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          router.replace(nextPath);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const nextQuery = `next=${encodeURIComponent(nextPath)}`;
      const errorQuery = authError ? `&oauth_error=${encodeURIComponent(authError)}` : "";
      router.replace(`/login?${nextQuery}${errorQuery}`);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        router.replace(nextPath);
      }
    });

    void finish();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [nextPath, router, supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Member auth</p>
        <h1 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-[-0.05em]">Finishing your Zmarty session</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">{status}</p>
      </div>
    </main>
  );
}
