"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Award } from "lucide-react";

interface Stats {
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  maxDrawdown: number;
  totalProfit: number;
  currentPositions: number;
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    winRate: 96.2,
    totalTrades: 47,
    profitFactor: 3.42,
    maxDrawdown: -8.3,
    totalProfit: 127.4,
    currentPositions: 1,
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 fade-in">
      {/* Win Rate */}
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-green-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</span>
        </div>
        <div className="text-3xl font-bold text-green-400">{stats.winRate}%</div>
        <div className="text-xs text-muted-foreground mt-1">Last 100 trades</div>
      </div>

      {/* Total Trades */}
      <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Trades</span>
        </div>
        <div className="text-3xl font-bold text-blue-400">{stats.totalTrades}</div>
        <div className="text-xs text-muted-foreground mt-1">All time</div>
      </div>

      {/* Profit Factor */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Profit Factor</span>
        </div>
        <div className="text-3xl font-bold text-purple-400">{stats.profitFactor.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground mt-1">Gross Profit / Loss</div>
      </div>

      {/* Max Drawdown */}
      <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Max Drawdown</span>
        </div>
        <div className="text-3xl font-bold text-red-400">{stats.maxDrawdown}%</div>
        <div className="text-xs text-muted-foreground mt-1">All time worst</div>
      </div>

      {/* Total Profit */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Profit</span>
        </div>
        <div className="text-3xl font-bold text-emerald-400">+{stats.totalProfit}%</div>
        <div className="text-xs text-muted-foreground mt-1">Since start</div>
      </div>

      {/* Current Positions */}
      <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Active</span>
        </div>
        <div className="text-3xl font-bold text-amber-400">{stats.currentPositions}</div>
        <div className="text-xs text-muted-foreground mt-1">Positions open</div>
      </div>
    </div>
  );
}
