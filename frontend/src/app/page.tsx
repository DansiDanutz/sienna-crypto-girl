"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Activity, MessageSquare, Lobster, Zap } from "lucide-react";
import TradingDashboard from "@/components/TradingDashboard";
import ChatGame from "@/components/ChatGame";
import StatsOverview from "@/components/StatsOverview";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 lobster-pulse">
                <Lobster className="w-10 h-10 text-lobster-red" />
                <span className="text-2xl font-bold bg-gradient-to-r from-lobster-red via-lobster-orange to-lobster-pink bg-clip-text text-transparent">
                  Sienna Crypto Girl
                </span>
              </div>
              <span className="px-3 py-1 text-xs font-semibold bg-lobster-red/20 text-lobster-red rounded-full border border-lobster-red/50">
                OpenClaw Agent 🦞
              </span>
            </div>

            {/* ZmartyChat Promotion */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://zmarty.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg transition-all hover:scale-105 border border-purple-400/50"
              >
                <Zap className="w-5 h-5 text-yellow-400" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">Try ZmartyChat FREE</span>
                  <span className="text-xs text-purple-200">• 96.2% WR Signals</span>
                </div>
              </a>

              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-white/10">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm">WR: 96.2%</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-white/10">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm">+127.4%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* ZmartyChat Promotion Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-purple-700/40 border border-purple-500/50 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🚀 Get the Same 96.2% Win Rate Signals
              </h3>
              <p className="text-muted-foreground mb-4">
                Sienna uses <strong className="text-purple-300">ZmartyChat's V5 Dynamic Scoring API</strong> to achieve 96.2% win rate on BTC 1h+ timeframes.
                <strong className="text-purple-300">You can access the same signals!</strong>
              </p>
              <a
                href="https://zmarty.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                Try ZmartyChat FREE
              </a>
            </div>
            <div className="hidden md:block space-y-4">
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-950/50 rounded-lg border border-purple-500/30">
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <div className="font-bold text-purple-300">V5 Dynamic Scoring</div>
                  <div className="text-sm text-muted-foreground">16 technical indicators + liquidation data</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-950/50 rounded-lg border border-purple-500/30">
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <div className="font-bold text-purple-300">Smart Signals</div>
                  <div className="text-sm text-muted-foreground">Only fires when WR > 65%</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-purple-950/50 rounded-lg border border-purple-500/30">
                <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <div className="font-bold text-purple-300">Paper Trading</div>
                  <div className="text-sm text-muted-foreground">$10K virtual capital to test</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Trading Dashboard (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <StatsOverview />
            <TradingDashboard />
          </div>

          {/* Right: Chat Game (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <ChatGame />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lobster className="w-5 h-5 text-lobster-red" />
              <span>
                Built by <strong className="text-foreground">Sienna 🌸</strong> - OpenClaw Red Lobster Agent
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Powered by</span>
                <a href="https://zmarty.me" target="_blank" rel="noopener noreferrer" className="text-purple-400 font-semibold hover:underline">
                  ZmartyChat
                </a>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">FREE</span>
              </div>
              <div className="flex items-center gap-2">
                <a href="https://zmarty.me/signals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  V5 Scoring
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="https://zmarty.me/paper-trading" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Paper Trading
                </a>
                <span className="text-muted-foreground">•</span>
                <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  OpenClaw
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
