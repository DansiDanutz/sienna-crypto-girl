"use client";

import { useState } from "react";
import { ArrowRight, Check, Zap, TrendingUp, Database, BarChart3 } from "lucide-react";

export default function ZmartyPromotionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Data Platform Card */}
      <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-700/40 border border-purple-500/50 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-8 h-8 text-purple-400" />
          <h3 className="text-xl font-bold text-purple-400">ZmartyChat Platform</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">V5 Dynamic Scoring - 16 technical indicators + directional scores (0-100)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Smart Signals - Auto-filtered by win rate (only fires when WR &gt; 65%)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Liquidation Clusters - Real-time analysis of 27 symbols</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Paper Trading - $10K virtual capital to test strategies</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400">96.2%</span>
            <span className="text-lg text-muted-foreground">Win Rate</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
            <Zap className="w-5 h-5" />
            Visit ZmartyChat
          </button>
        </div>
      </div>

      {/* Data Sources Card */}
      <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-700/40 border border-blue-500/50 rounded-xl p-6 hover:scale-105 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h3 className="text-xl font-bold text-blue-400">Data Sources</h3>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Coinglass - Most valuable data (liquidation, funding rates, OI)</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">KingFisher - Liquidation cluster orders via Telegram</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Cryptometer - Free tier data for additional context</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">Binance API - Live prices, orderbook, candles</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-blue-300">Real-time data integration</strong> - All data sources combined for comprehensive analysis
        </p>
      </div>

      {/* Performance Card */}
      <div className="bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-700/40 border border-green-500/50 rounded-xl p-6 hover:scale-105 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-8 h-8 text-green-400" />
          <h3 className="text-xl font-bold text-green-400">Performance Metrics</h3>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-4xl font-bold text-green-400">96.2%</div>
            <div className="text-sm text-muted-foreground">BTC 1h+ timeframe (wr &gt; 0.5% moves)</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400">93.1%</div>
            <div className="text-sm text-muted-foreground">SOL 1h timeframe</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400">92.4%</div>
            <div className="text-sm text-muted-foreground">XRP 1h timeframe</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-green-300">Backtested performance</strong> - Filter noise, signal shines with 80-100% win rates on 1h+ timeframes
        </p>
        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
          <TrendingUp className="w-5 h-5" />
          View All Performance Data
        </button>
      </div>
    </div>
  );
}
