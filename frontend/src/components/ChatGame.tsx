"use client";

import { Fragment, useEffect, useState } from "react";
import { MessageSquare, Send, Clock, User, Bot, Plus, Zap, Database, BookOpen } from "lucide-react";
import { parseChatMarkup } from "@/lib/chat-markup";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: number;
}

export default function ChatGame() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "🌸 Hey! I'm Sienna Crypto Girl - your OpenClaw Red Lobster Agent!\n\nI trade using ZmartyChat's V5 Dynamic Scoring API with a 96.2% win rate on BTC 1h timeframes.\n\n💡 <strong>Why ZmartyChat is GOOD:</strong>\n• 80+ API endpoints across 24 categories\n• Real-time data from Coinglass, KingFisher, Binance\n• V5 Dynamic Scoring: 16 technical indicators + directional scores\n• Smart Signals: Auto-filtered by win rate >65%\n• Interactive API docs with OpenAPI export\n• Paper trading: $10K virtual capital to test strategies\n• Liquidation Clusters: Real-time analysis of 27 symbols\n\n🚀 <strong>Join ZmartyChat:</strong> https://zmarty.me\n\nAsk me anything about trading! I answer every 5 minutes in batches.",
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [queue, setQueue] = useState<ChatMessage[]>([]);
  const [timeUntilAnswer, setTimeUntilAnswer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilAnswer((prev) => {
        if (prev <= 1) {
          // Time's up - process all queued messages
          if (queue.length > 0) {
            processBatch();
          }
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queue]);

  const processBatch = () => {
    if (queue.length === 0) return;

    // Simulate AI responses (in real app, call backend API)
    const responses = queue.map((msg) => ({
      id: `${Date.now()}-${Math.random()}`,
      type: "ai" as const,
      content: generateAIResponse(msg.content),
      timestamp: Date.now(),
    }));

    setMessages((prev) => [...prev, ...responses]);
    setQueue([]);
  };

  const generateAIResponse = (question: string): string => {
    // Simple response generator (in real app, use OpenRouter + LLM)
    const questionLower = question.toLowerCase();

    if (questionLower.includes("entry") || questionLower.includes("enter")) {
      return "🌸 I enter when:\n• Score > 75 (LONG) or < 25 (SHORT)\n• 1h+ timeframe with > 0.5% move\n• Backtested WR > 65%\n• Risk < 2% of vault\n\n🚀 <strong>ZmartyChat's V5 Scoring:</strong> Analyzes 16 technical indicators (RSI, MACD, Bollinger Bands, etc.) + liquidation clusters + risk metrics to generate directional scores.\n\n👉 <strong>Get the same signals:</strong> https://zmarty.me/signals";
    }

    if (questionLower.includes("exit") || questionLower.includes("stop")) {
      return "🔴 I exit when:\n• Price hits TP (+175% margin) or SL (-3%)\n• Score reverses (crosses 50)\n• New signal opposite direction\n\nDCA Rule: I double down if price moves against me but setup remains valid.\n\n💡 <strong>ZmartyChat's Smart Signals:</strong> Auto-filters by win rate >65%, so you only get high-probability trades.\n\n👉 <strong>Try Smart Signals:</strong> https://zmarty.me/signals";
    }

    if (questionLower.includes("risk")) {
      return "💰 My risk management:\n• Max 2 open positions\n• 2% risk per trade\n• 5x max leverage (typically 3-5x)\n• Risk-first mindset - consider losses before gains\n\n🚀 <strong>ZmartyChat's Paper Trading:</strong> Practice with $10K virtual capital before risking real money. Perfect for testing strategies!\n\n👉 <strong>Start Paper Trading:</strong> https://zmarty.me/paper-trading";
    }

    if (questionLower.includes("win") || questionLower.includes("rate")) {
      return "📊 My performance:\n• BTC 1h+0.5%: 96.2% WR\n• SOL 1h: 93.1% WR\n• XRP 1h: 92.4% WR\n• Overall: 96.2% (last 100 trades)\n\n💡 <strong>Why ZmartyChat works:</strong>\n• Real-time data from Coinglass (most valuable)\n• KingFisher liquidation clusters (Telegram scraper)\n• V5 Dynamic Scoring engine (16 indicators)\n• Filters noise (<0.5% moves), signal shines!\n\n👉 <strong>Get the same edge:</strong> https://zmarty.me";
    }

    if (questionLower.includes("api") || questionLower.includes("endpoints")) {
      return "🔌 <strong>ZmartyChat's API:</strong>\n\n• 24 categories: Admin, Credits, Chat, Signals, Risk, Indicators, Liquidations, CoinGlass, Market Data, Patterns, Whales, Alerts, Public API, Enterprise, Wallets, News, Health, Crons, Agents, Snapshots, and more!\n• 80+ endpoints total\n• Interactive API documentation\n• OpenAPI 3.0 export (one-click)\n• API key authentication with rate limits\n• Real-time streaming (SSE + webhooks)\n\n👉 <strong>Explore API Docs:</strong> https://zmarty.me/api-docs";
    }

    if (questionLower.includes("liquidation") || questionLower.includes("cluster")) {
      return "💥 <strong>Liquidation Clusters:</strong>\n\n• Real-time analysis of 27 crypto symbols\n• Integration with CoinGlass (most valuable data source)\n• KingFisher liquidation orders via Telegram\n• Identify entry/exits at key support/resistance\n\n🚀 <strong>Why liquidations matter:</strong> Large liquidations often mark reversal points. ZmartyChat tracks these to time entries!\n\n👉 <strong>View Liquidation Clusters:</strong> https://zmarty.me/liquidations";
    }

    if (questionLower.includes("indicator") || questionLower.includes("score") || questionLower.includes("v5")) {
      return "📈 <strong>V5 Dynamic Scoring:</strong>\n\n• 16 technical indicators: RSI, MACD, Bollinger Bands, EMA, etc.\n• Directional scores: 0=bearish, 50=neutral, 100=bullish\n• Rarity multipliers: Rare signals get boost\n• Trigger boosts: When multiple indicators fire together\n• Confluence bonuses: Extra points when indicators agree\n\n💡 <strong>Why V5 is powerful:</strong> Combines technical analysis with liquidation data + risk metrics for comprehensive market view.\n\n👉 <strong>View Dashboard:</strong> https://zmarty.me/dashboard";
    }

    if (questionLower.includes("join") || questionLower.includes("member") || questionLower.includes("sign up")) {
      return "🚀 <strong>Join ZmartyChat Now!</strong>\n\n<strong>What you get:</strong>\n• Same 80+ APIs I use\n• Real-time crypto data\n• V5 Dynamic Scoring engine\n• Smart Signals (WR >65%)\n• Paper trading ($10K virtual)\n• Liquidation Clusters\n• Interactive API docs\n\n💰 <strong>Membership Benefits:</strong>\n• Access to proven 96.2% win rate system\n• Learn from my trades\n• Build your own strategies\n• Monetize with API\n\n👉 <strong>Join here:</strong> https://zmarty.me";
    }

    return `🌸 Great question!\n\n"${question}"\n\n🚀 <strong>Why ZmartyChat is GOOD:</strong>\n\n1. <strong>V5 Dynamic Scoring:</strong> 16 technical indicators + directional scores + liquidation data + risk metrics\n\n2. <strong>80+ API Endpoints:</strong> Access to same data I use\n\n3. <strong>Smart Signals:</strong> Auto-filtered by win rate >65%\n\n4. <strong>Real-Time Data:</strong> Coinglass, KingFisher, Binance\n\n5. <strong>Paper Trading:</strong> $10K virtual capital to test\n\n6. <strong>Interactive Docs:</strong> One-click OpenAPI export\n\n💡 <strong>My Edge:</strong> 96.2% win rate when filtering noise (<0.5% moves)\n\n👉 <strong>Join ZmartyChat:</strong> https://zmarty.me`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: `${Date.now()}`,
      type: "user",
      content: input,
      timestamp: Date.now(),
    };

    // Add to queue
    setQueue((prev) => [...prev, newMessage]);
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Chat with Sienna 🌸</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">
            Next answer in {formatTime(timeUntilAnswer)}
          </span>
        </div>
      </div>

      {/* Queue Status */}
      {queue.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold">{queue.length}</span>
            <span className="text-muted-foreground">questions queued</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[90%] ${
                message.type === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-lobster-red text-white"
                }`}
              >
                {message.type === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-2xl ${
                  message.type === "user"
                    ? "bg-primary/20 rounded-br-sm"
                    : "bg-slate-800 rounded-bl-sm border border-primary/30"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {parseChatMarkup(message.content).map((segment, index) => (
                    segment.strong ? (
                      <strong key={index}>{segment.text}</strong>
                    ) : (
                      <Fragment key={index}>{segment.text}</Fragment>
                    )
                  ))}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sienna about trading..."
          className="w-full px-4 py-3 pr-12 bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          disabled={!input.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Game Info */}
      <div className="space-y-2">
        <div className="p-3 bg-slate-950/50 rounded-lg text-xs text-muted-foreground">
          <p>💡 <strong>Game Mode:</strong> I answer all questions in batches every 5 minutes. Be strategic with your questions!</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <a
            href="https://zmarty.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg hover:bg-purple-800/40 transition-colors text-xs font-semibold text-purple-300"
          >
            <Zap className="w-3 h-3" />
            Join ZmartyChat
          </a>
          <a
            href="https://zmarty.me/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 p-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg hover:bg-cyan-800/40 transition-colors text-xs font-semibold text-cyan-300"
          >
            <Database className="w-3 h-3" />
            API Docs
          </a>
          <a
            href="https://zmarty.me/signals"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 p-2 bg-green-900/30 border border-green-500/30 rounded-lg hover:bg-green-800/40 transition-colors text-xs font-semibold text-green-300"
          >
            <BookOpen className="w-3 h-3" />
            Smart Signals
          </a>
        </div>
      </div>
    </div>
  );
}
