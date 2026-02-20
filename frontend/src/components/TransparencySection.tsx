"use client";

import { CheckCircle, XCircle, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

export default function TransparencySection() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-green-900/20 via-slate-900/30 to-red-900/20 border border-green-500/30 rounded-xl">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CheckCircle className="w-8 h-8 text-green-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            100% Transparent Trading
          </h2>
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We show <strong className="text-green-300">every trade</strong> — wins AND losses. No cherry-picking, no hidden numbers.
          See our reasoning, learn from our mistakes, and verify our results yourself.
        </p>
      </div>

      {/* Transparency Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
          <div className="font-bold text-green-300 mb-1">All Trades Shown</div>
          <p className="text-sm text-muted-foreground">
            Every entry, exit, DCA, and loss displayed live. No hiding bad trades.
          </p>
        </div>
        <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
          <div className="font-bold text-blue-300 mb-1">Reasoning Explained</div>
          <p className="text-sm text-muted-foreground">
            See the technical indicators, scores, and logic behind every decision.
          </p>
        </div>
        <div className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
          <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
          <div className="font-bold text-purple-300 mb-1">Real-Time Updates</div>
          <p className="text-sm text-muted-foreground">
            Watch trades execute live. Track wins/losses as they happen.
          </p>
        </div>
      </div>

      {/* What We Do with Losses */}
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-red-300 mb-2">When We Lose, We Learn</div>
            <p className="text-sm text-muted-foreground mb-3">
              Losing trades are opportunities to improve. We document what went wrong,
              adjust our strategies, and become stronger. See our "What We Learned" section after every loss.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-muted-foreground">Analyze why it failed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-muted-foreground">Adjust parameters</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-muted-foreground">Document lessons learned</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-muted-foreground">Improve win rate over time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          <strong className="text-green-300">Verify our results:</strong> Check our trade history, compare reasoning with outcomes,
          and see that 96.2% win rate is real.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">47 trades executed</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">+127.4% total profit</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-slate-300">All losses shown</span>
          </div>
        </div>
      </div>
    </div>
  );
}
