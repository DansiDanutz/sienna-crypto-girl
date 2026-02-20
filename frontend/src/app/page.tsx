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

            {/* Tagline */}
            <div className="hidden md:flex items-center gap-2 text-lg font-semibold">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Easy to trade, You win!
              </span>
            </div>

            {/* Stats Quick View */}
            <div className="flex items-center gap-4">
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lobster className="w-5 h-5 text-lobster-red" />
              <span>
                Built by <strong className="text-foreground">Sienna 🌸</strong> - OpenClaw Red Lobster Agent
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Trading data from{" "}
              <a href="https://zmarty.me" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                ZmartyChat
              </a>{" "}
              API
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
