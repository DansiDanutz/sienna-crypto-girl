"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  Info,
  Percent,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import LivePriceTicker from "@/components/LivePriceTicker";
import { type Trade, toChartTime } from "@/lib/live-data";
import { useLiveCandles } from "@/lib/useLiveCandles";
import { useLiveStats } from "@/lib/useLiveStats";
import { useLiveTrades } from "@/lib/useLiveTrades";
import { useSmartSignals } from "@/lib/useSmartSignals";

type PerformanceSnapshot = {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
};

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: value >= 1000 ? 0 : 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });
}

function formatPercent(value: number, digits = 1) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildPerformance(trades: Trade[], stats: ReturnType<typeof useLiveStats>["stats"]): PerformanceSnapshot {
  const closedTrades = trades.filter((trade) => typeof trade.profit === "number");
  const winningTrades = closedTrades.filter((trade) => (trade.profit ?? 0) > 0);
  const losingTrades = closedTrades.filter((trade) => (trade.profit ?? 0) <= 0);

  const avgProfit = winningTrades.length
    ? winningTrades.reduce((total, trade) => total + (trade.profit ?? 0), 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length
    ? losingTrades.reduce((total, trade) => total + (trade.profit ?? 0), 0) / losingTrades.length
    : 0;

  return {
    totalTrades: stats.totalTrades || closedTrades.length,
    winRate: stats.winRate,
    totalProfit: stats.totalProfit,
    avgProfit,
    avgLoss,
    profitFactor: stats.profitFactor,
  };
}

function LoadingCard() {
  return <div className="h-36 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/60" />;
}

function SignalSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl border border-slate-700/40 bg-slate-800/60" />
      ))}
    </div>
  );
}

export default function TradingDashboard() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const { trades, loading: tradesLoading, error: tradesError } = useLiveTrades();
  const { stats, loading: statsLoading, error: statsError } = useLiveStats();
  const { candles, loading: candlesLoading, error: candlesError } = useLiveCandles();
  const { signals, loading: signalsLoading, error: signalsError } = useSmartSignals();

  const performance = buildPerformance(trades, stats);
  const openTrades = trades.filter((trade) => trade.status === "OPEN");
  const signalPreview = signals.slice(0, 3);
  const errors = [
    ["Trades API", tradesError],
    ["Stats API", statsError],
    ["Binance candles", candlesError],
    ["Smart signals", signalsError],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#e2e8f0",
      },
      grid: {
        vertLines: { color: "#1e293b30" },
        horzLines: { color: "#1e293b30" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (!chartContainerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    candleSeriesRef.current.setData(candles as CandlestickData<UTCTimestamp>[]);
    candleSeriesRef.current.setMarkers(
      trades.flatMap((trade) => {
        const markers: Array<{
          time: UTCTimestamp;
          position: "aboveBar" | "belowBar";
          color: string;
          shape: "arrowUp" | "arrowDown" | "circle";
          text: string;
        }> = [
          {
            time: toChartTime(trade.entryTime),
            position: "belowBar" as const,
            color: trade.type === "LONG" ? "#22c55e" : "#f97316",
            shape: trade.type === "LONG" ? ("arrowUp" as const) : ("circle" as const),
            text: `${trade.type} ${trade.symbol}`,
          },
        ];

        if (trade.exitTime) {
          markers.push({
            time: toChartTime(trade.exitTime),
            position: "aboveBar" as const,
            color: "#ef4444",
            shape: "arrowDown" as const,
            text: `EXIT ${trade.symbol}`,
          });
        }

        return markers;
      }),
    );

    chartRef.current?.timeScale().fitContent();
  }, [candles, trades]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="mt-2 text-purple-200">
              Live Zmarty trading signals, recent paper trades, and Binance market structure in one view.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <LivePriceTicker />
        </div>

        {errors.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Some live feeds are degraded
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {errors.map(([label, message]) => (
                <div key={label}>
                  <span className="font-semibold">{label}:</span> {message}
                </div>
              ))}
            </div>
          </div>
        )}

        {statsLoading && performance.totalTrades === 0 ? (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <LoadingCard key={item} />
            ))}
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Total Trades</h3>
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-white">{performance.totalTrades}</p>
              <p className="text-sm text-slate-400">Closed trades in live history</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Win Rate</h3>
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
              <p className="text-sm text-slate-400">Computed from backend trade history</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Total Profit</h3>
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-white">${formatCurrency(performance.totalProfit)}</p>
              <p className={`text-sm ${performance.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {performance.totalProfit >= 0 ? "Net positive" : "Drawdown active"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Open Positions</h3>
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-white">{stats.currentPositions}</p>
              <p className="text-sm text-slate-400">{openTrades.length} visible in the recent trade feed</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Average Winner</h3>
                <Percent className="h-5 w-5 text-blue-400" />
              </div>
              <p className={`mb-1 text-4xl font-bold ${performance.avgProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatPercent(performance.avgProfit, 2)}
              </p>
              <p className="text-sm text-slate-400">Across profitable closed trades</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Average Loser</h3>
                <ArrowDown className="h-5 w-5 text-rose-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-red-400">{formatPercent(performance.avgLoss, 2)}</p>
              <p className="text-sm text-slate-400">Loss containment per closed loser</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Profit Factor</h3>
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-purple-300">{stats.profitFactor.toFixed(2)}:1</p>
              <p className="text-sm text-slate-400">Gross winners vs gross losers</p>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Max Drawdown</h3>
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mb-1 text-4xl font-bold text-amber-300">{stats.maxDrawdown.toFixed(1)}%</p>
              <p className="text-sm text-slate-400">Worst equity drop in live stats</p>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-xl border border-indigo-700/50 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <Info className="h-6 w-6 text-indigo-300" />
            <h2 className="text-xl font-bold text-white">Understanding Your Trading Signals</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-950/50 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-200">
                <Target className="h-4 w-4" />
                Score (0-100)
              </h3>
              <p className="text-sm leading-relaxed text-indigo-300">
                Zmarty signal conviction comes from the scoring engine. Higher numbers indicate stronger alignment
                across the trading inputs feeding the model.
              </p>
            </div>

            <div className="rounded-lg border border-indigo-700/30 bg-indigo-950/50 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-200">
                <TrendingUp className="h-4 w-4" />
                Win Rate (%)
              </h3>
              <p className="text-sm leading-relaxed text-indigo-300">
                Win rate reflects historical outcomes for similar setups in the tracked paper-trade history. It is
                descriptive, not a guarantee of future performance.
              </p>
            </div>

            <div className="rounded-lg border border-indigo-700/30 bg-indigo-950/50 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-indigo-200">
                <CheckCircle className="h-4 w-4" />
                Risk Discipline
              </h3>
              <p className="text-sm leading-relaxed text-indigo-300">
                The dashboard separates signal quality, open exposure, and realized trade outcomes so users can review
                performance without pretending the product is an auto-executing broker.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">BTCUSDT Market Structure</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span>Entry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span>Exit</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div ref={chartContainerRef} className="h-[400px] w-full" />
                {candlesLoading && candles.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/50 text-sm text-slate-300">
                    Loading Binance candles…
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Binance REST candles refresh every 5 minutes with trade markers layered from the backend API.</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">Recent Trades</h2>
                <div className="text-sm text-slate-400">Showing {trades.length} trades from the live backend feed</div>
              </div>

              {tradesLoading && trades.length === 0 ? (
                <SignalSkeleton />
              ) : trades.length === 0 ? (
                <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-5 text-sm text-slate-300">
                  No trade history is available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div
                      key={trade.id}
                      className={`rounded-lg border p-4 transition-all hover:border-purple-500/50 ${
                        trade.status === "OPEN"
                          ? "border-green-500/30 bg-green-900/20"
                          : trade.status === "CLOSED"
                            ? "border-slate-700/30 bg-slate-800/50"
                            : "border-yellow-500/30 bg-yellow-900/20"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              trade.type === "LONG" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {trade.type}
                          </div>
                          <span className="font-semibold text-slate-100">{trade.symbol}</span>
                          <span className="rounded bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                            Score: {trade.score}
                          </span>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            trade.status === "OPEN"
                              ? "bg-green-500 text-white"
                              : trade.status === "CLOSED"
                                ? "bg-slate-700 text-slate-300"
                                : "bg-yellow-500 text-white"
                          }`}
                        >
                          {trade.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <span className="text-slate-400">Entry:</span>{" "}
                          <span className="font-semibold text-slate-100">${formatCurrency(trade.entryPrice)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Time:</span>{" "}
                          <span className="font-semibold text-slate-100">{formatDate(trade.entryTime)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">WR:</span>{" "}
                          <span className="font-semibold text-purple-300">{trade.winRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">DCA:</span>{" "}
                          <span className="font-semibold text-slate-100">{trade.dcaCount ?? 0}</span>
                        </div>
                        {trade.exitPrice !== undefined && (
                          <div>
                            <span className="text-slate-400">Exit:</span>{" "}
                            <span className="font-semibold text-slate-100">${formatCurrency(trade.exitPrice)}</span>
                          </div>
                        )}
                        {trade.exitTime !== undefined && (
                          <div>
                            <span className="text-slate-400">Closed:</span>{" "}
                            <span className="font-semibold text-slate-100">{formatDate(trade.exitTime)}</span>
                          </div>
                        )}
                        {trade.profit !== undefined && (
                          <div className={trade.profit > 0 ? "text-green-400" : "text-red-400"}>
                            <span className="text-slate-400">P&L:</span>{" "}
                            <span className="font-semibold">{formatPercent(trade.profit, 2)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 rounded-lg bg-slate-950/50 p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {trade.status === "OPEN" && <ArrowUp className="h-4 w-4 text-green-400" />}
                            {trade.status === "CLOSED" && <ArrowDown className="h-4 w-4 text-red-400" />}
                            {trade.status === "DCA" && <Circle className="h-4 w-4 text-yellow-400" />}
                          </div>
                          <p className="leading-relaxed text-slate-300">{trade.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-100">Smart Signals</h2>
                <span className="text-sm text-slate-400">Refreshed every 2 minutes</span>
              </div>

              {signalsLoading && signals.length === 0 ? (
                <SignalSkeleton />
              ) : signalPreview.length === 0 ? (
                <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-5 text-sm text-slate-300">
                  No high-conviction smart signals are available right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {signalPreview.map((signal) => {
                    const bullish = !signal.direction.toUpperCase().includes("SHORT");
                    return (
                      <div key={signal.id} className="rounded-xl border border-slate-700/40 bg-slate-950/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{signal.symbol}</div>
                            <div className={`mt-1 text-xs font-semibold ${bullish ? "text-green-400" : "text-red-400"}`}>
                              {signal.direction}
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                            {signal.score !== null && <div>Score {signal.score.toFixed(0)}</div>}
                            {signal.winRate !== null && <div>WR {signal.winRate.toFixed(1)}%</div>}
                            {signal.timeframe && <div>{signal.timeframe}</div>}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{signal.reasoning}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Powered by ZmartyChat signal data and Binance market feeds.</span>
          </div>
          <p>Live signals, paper-trade review, and market context stay visible without implying auto-execution.</p>
        </div>
      </div>
    </div>
  );
}
