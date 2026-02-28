"use client";

import { useState } from "react";
import { ArrowRight, Check, Crown, Zap, TrendingUp, Users, Target, Shield } from "lucide-react";

export default function MonetizationCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Premium Signals Card */}
      <div className="bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-700/40 border border-amber-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
          <h3 className="text-xl font-bold text-amber-400">Premium Signals</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">96.2% Win Rate on BTC 1h+ timeframes</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Auto-filtered signals (WR &gt; 65%)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Real-time ZmartyChat V5 Scoring</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Instant push notifications</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <Zap className="w-5 h-5" />
            Subscribe to Premium
          </button>
        </div>
      </div>

      {/* Copy Trading Card */}
      <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-700/40 border border-blue-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-8 h-8 text-blue-400" />
          <h3 className="text-xl font-bold text-blue-400">Copy Trading</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Same entries and exits as Sienna</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Risk management (2% per trade)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Automated position sizing</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Stop loss & take profit auto-placed</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400">15%</span>
            <span className="text-muted-foreground">profit share</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <TrendingUp className="w-5 h-5" />
            Copy My Trades
          </button>
        </div>
      </div>

      {/* Trading Course Card */}
      <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-700/40 border border-purple-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-8 h-8 text-purple-400" />
          <h3 className="text-xl font-bold text-purple-400">Trading Course</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Learn V5 Dynamic Scoring System</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Risk management strategies (2% rule)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">DCA strategies (when to double down)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Backtesting with real data</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400">$199</span>
            <span className="text-muted-foreground">one-time</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <ArrowRight className="w-5 h-5" />
            Start Learning
          </button>
        </div>
      </div>

      {/* 100 Trades Challenge Card */}
      <div className="bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-700/40 border border-green-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-green-400" />
          <h3 className="text-xl font-bold text-green-400">100 Trades Challenge</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Complete 100 documented trades</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Entry reason, exit reason, net P&L</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Exact fees, lessons learned</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Earn real money trading privileges</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl font-bold text-green-400">4/100</div>
            <span className="text-muted-foreground text-sm">completed</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <TrendingUp className="w-5 h-5" />
            Join Challenge
          </button>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="bg-gradient-to-br from-pink-900/40 via-pink-800/30 to-pink-700/40 border border-pink-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-8 h-8 text-pink-400" />
          <h3 className="text-xl font-bold text-pink-400">Referral Program</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Earn 20% commission on referrals</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Lifetime recurring commissions</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Easy share links</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Real-time earnings dashboard</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-pink-400">20%</span>
            <span className="text-muted-foreground">commission</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <Zap className="w-5 h-5" />
            Start Referring
          </button>
        </div>
      </div>
    </div>
  );
}
