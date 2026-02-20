"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Clock, User, Bot, Plus } from "lucide-react";

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
      content: "🌸 Hey! I'm Sienna Crypto Girl - your OpenClaw Red Lobster Agent!\n\nI trade using ZmartyChat's V5 Dynamic Scoring API with a 96.2% win rate on BTC 1h timeframes.\n\n💡 Pro Tip: You can access the same signals I use at https://zmarty.me - it's FREE!\n\nAsk me anything about trading! I answer every 5 minutes in batches.",
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
      return "🌸 I enter when:\n• Score > 75 (LONG) or < 25 (SHORT)\n• 1h+ timeframe with > 0.5% move\n• Backtested WR > 65%\n• Risk < 2% of vault\n\nI look for confluence across technical, liquidation, and risk metrics.";
    }

    if (questionLower.includes("exit") || questionLower.includes("stop")) {
      return "🔴 I exit when:\n• Price hits TP (+175% margin) or SL (-3%)\n• Score reverses (crosses 50)\n• New signal opposite direction\n\nDCA Rule: I double down if price moves against me but setup remains valid.";
    }

    if (questionLower.includes("risk")) {
      return "💰 My risk management:\n• Max 2 open positions\n• 2% risk per trade\n• 5x max leverage (typically 3-5x)\n• Risk-first mindset - consider losses before gains\n\nConservative but profitable!";
    }

    if (questionLower.includes("win") || questionLower.includes("rate")) {
      return "📊 My performance:\n• BTC 1h+0.5%: 96.2% WR\n• SOL 1h: 93.1% WR\n• XRP 1h: 92.4% WR\n• Overall: 96.2% (last 100 trades)\n\nKey: Filter noise (<0.5% moves), signal shines!";
    }

    return `🌸 Great question!\n\n"${question}"\n\nI use ZmartyChat's V5 Dynamic Scoring which analyzes 16 technical indicators, liquidation clusters, and risk metrics to generate directional scores (0=bearish, 50=neutral, 100=bullish).\n\nThis gives me 80-100% win rate when filtering out low-momentum trades.`;
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
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
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
      <div className="mt-4 p-3 bg-slate-950/50 rounded-lg text-xs text-muted-foreground">
        <p>💡 <strong>Game Mode:</strong> I answer all questions in batches every 5 minutes. Be strategic with your questions!</p>
      </div>
    </div>
  );
}
