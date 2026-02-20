"use client";

import { ArrowRight, Zap, BookOpen } from "lucide-react";

const API_CATEGORIES = [
  { icon: "🔐", name: "Admin", endpoints: "10+", desc: "System management & user control" },
  { icon: "💰", name: "Credits & Payments", endpoints: "3+", desc: "Stripe payments, credit system" },
  { icon: "💬", name: "Chat & AI", endpoints: "3+", desc: "AI chat, streaming, memory" },
  { icon: "📊", name: "Signals & Trading", endpoints: "5+", desc: "Smart signals, paper trading" },
  { icon: "⚠️", name: "Risk Metrics", endpoints: "3+", desc: "Risk scoring & band analysis" },
  { icon: "📈", name: "Technical Indicators", endpoints: "5+", desc: "V5 Dynamic Scoring, 16 indicators" },
  { icon: "💥", name: "Liquidations", endpoints: "4+", desc: "Clusters, heatmaps, analysis" },
  { icon: "🔮", name: "CoinGlass Data", endpoints: "3+", desc: "Liquidation & market data" },
  { icon: "📉", name: "Market Data", endpoints: "5+", desc: "Real-time CCXT exchange data" },
  { icon: "🎯", name: "Patterns & Confidence", endpoints: "4+", desc: "Pattern recognition & validation" },
  { icon: "🐋", name: "Whales & Alerts", endpoints: "3+", desc: "Whale tracking & alert systems" },
  { icon: "🤝", name: "Referrals", endpoints: "3+", desc: "Commission tracking & payouts" },
  { icon: "🌐", name: "Public API", endpoints: "4+", desc: "API keys, webhooks, signals" },
  { icon: "⚙️", name: "Configuration", endpoints: "3+", desc: "User & system config" },
  { icon: "🏢", name: "Enterprise", endpoints: "3+", desc: "Multi-tenant management" },
  { icon: "💳", name: "Wallets", endpoints: "3+", desc: "Multi-wallet paper trading" },
  { icon: "📰", name: "News & Reports", endpoints: "3+", desc: "AI news aggregation & reports" },
  { icon: "💚", name: "Health & Monitoring", endpoints: "3", desc: "System health & Prometheus metrics" },
  { icon: "⏰", name: "Cron Webhooks", endpoints: "3+", desc: "Scheduled job triggers" },
  { icon: "🤖", name: "Agents", endpoints: "3+", desc: "AI agent management (Lerty.ai ready)" },
  { icon: "📜", name: "Trigger History", endpoints: "3+", desc: "Signal trigger tracking" },
  { icon: "📸", name: "Symbol Snapshots", endpoints: "3+", desc: "Point-in-time data snapshots" },
  { icon: "🔗", name: "Manus Webhooks", endpoints: "2+", desc: "Manus AI agent integration" },
  { icon: "🎫", name: "Bids", endpoints: "3+", desc: "Roadmap locomotive bid system" },
];

export default function APIDocumentationCard() {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            📚 Full API Documentation for Subscribers
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          <strong className="text-cyan-300">24 API categories</strong> with <strong className="text-cyan-300">80+ endpoints</strong> — 
          the same APIs that power Sienna&apos;s 96.2% win rate. 
          Interactive docs with OpenAPI export, code examples, and auth guides.
        </p>
      </div>

      {/* API Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {API_CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center gap-1 p-3 bg-slate-900/60 border border-slate-700/50 rounded-lg hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all group"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300 text-center leading-tight">
              {cat.name}
            </span>
            <span className="text-[10px] text-slate-500">{cat.endpoints} endpoints</span>
          </div>
        ))}
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-xl">
          <div className="text-lg font-bold text-cyan-300 mb-1">🔑 API Key Auth</div>
          <p className="text-sm text-muted-foreground">
            Generate API keys, set rate limits, track usage. Public endpoints for external integrations.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl">
          <div className="text-lg font-bold text-purple-300 mb-1">📋 OpenAPI Export</div>
          <p className="text-sm text-muted-foreground">
            One-click OpenAPI 3.0 spec export. Import into Postman, Swagger UI, or any REST client.
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl">
          <div className="text-lg font-bold text-green-300 mb-1">🔄 Real-Time Streaming</div>
          <p className="text-sm text-muted-foreground">
            SSE streaming for chat, webhooks for signals. Build your own trading bot with our data.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href="https://zmarty.me/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all hover:scale-105 text-lg"
        >
          <Zap className="w-5 h-5" />
          Explore API Documentation
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="text-xs text-slate-500 mt-2">
          Free tier available • No credit card required • Interactive docs
        </p>
      </div>
    </div>
  );
}
