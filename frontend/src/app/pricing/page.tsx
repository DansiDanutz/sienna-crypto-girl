import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BackActions from "@/components/BackActions";
import MonetizationCards from "@/components/MonetizationCards";

export const metadata = {
  title: "Pricing | Zmarty",
  description: "Review Zmarty tiers for aggregated market data, LLM-assisted analysis, and paid API access to analytics services.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        <BackActions fallbackHref="/" homeHref="/" backLabel="Back to site" />
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Pricing ladder</p>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Zmarty plans for intelligence, data, and API access</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Zmarty is a market data and intelligence product. These plans separate public review access from paid
            member usage, protected API access, and higher-intensity data consumption. Zmarty does not execute
            trades and does not provide financial advice.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
            >
              Open app
            </Link>
            <Link
              href="/login?next=%2Faccount%3Fview%3Dtiers"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-400"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://zmarty.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-100"
            >
              Live product site
            </a>
          </div>
        </section>

        <MonetizationCards />
      </div>
    </main>
  );
}
