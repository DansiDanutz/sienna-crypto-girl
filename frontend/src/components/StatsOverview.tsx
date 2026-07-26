"use client";

import { Activity, Award, DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react";

import { useLiveStats } from "@/lib/useLiveStats";

function StatSkeleton() {
  return <div className="h-32 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/60" />;
}

export default function StatsOverview() {
  const { stats, loading, error } = useLiveStats();

  if (loading && stats.totalTrades === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 fade-in md:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <StatSkeleton key={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
          Failed to load live stats: {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 fade-in md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-900/30 to-green-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-green-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Win Rate</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.winRate.toFixed(1)}%</div>
          <div className="mt-1 text-xs text-muted-foreground">Live backend stats</div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Total Trades</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{stats.totalTrades}</div>
          <div className="mt-1 text-xs text-muted-foreground">Closed history</div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Profit Factor</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">{stats.profitFactor.toFixed(2)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Gross profit / loss</div>
        </div>

        <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/30 to-red-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Max Drawdown</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.maxDrawdown.toFixed(1)}%</div>
          <div className="mt-1 text-xs text-muted-foreground">Worst equity dip</div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Total Profit</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{stats.totalProfit.toFixed(1)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Net closed-trade P&L</div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-800/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-400" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Active</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{stats.currentPositions}</div>
          <div className="mt-1 text-xs text-muted-foreground">Positions open</div>
        </div>
      </div>
    </div>
  );
}
