"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function BackActions({
  fallbackHref = "/",
  homeHref = "/",
  backLabel = "Back",
}: {
  fallbackHref?: string;
  homeHref?: string;
  backLabel?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>
      <Link
        href={homeHref}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
    </div>
  );
}
