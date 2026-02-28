"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { 
  ArrowUp, 
  ArrowDown, 
  Circle, 
  Clock, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  type: "LONG" | "SHORT";
  status: "OPEN" | "CLOSED" | "DCA";
  score: number;
  winRate: number;
  reasoning: string;
  entryTime: number;
  exitTime?: number;
  profit?: number;
  dcaCount?: number;
}

interface ChartMarker {
  time: number;
  position: "aboveBar" | "belowBar";
  color: string;
  shape: "arrowUp" | "arrowDown" | "circle";
  text: string;
}

export default function TradingDashboard() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Sample trade data - in production, fetch from ZmartyChat API
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      entryPrice: 67234.50,
      type: "LONG",
      status: "OPEN",
      score: 82,
      winRate: 96.2,
      reasoning: "Score 82/100 (bullish) - 1h timeframe >0.5% move - Strong buy signal with liquidation support",
      entryTime: Date.now() - 3600000,
      dcaCount: 0,
    },
    {
      id: "2",
      symbol: "ETHUSDT",
      entryPrice: 3456.78,
      exitPrice: 3589.12,
      type: "LONG",
      status: "CLOSED",
      score: 78,
      winRate: 94.8,
      reasoning: "Score 78/100 - Strong momentum with whale inflows detected",
      entryTime: Date.now() - 7200000,
      exitTime: Date.now() - 5400000,
      profit: 3.83,
      dcaCount: 0,
    },
    {
      id: "3",
      symbol: "SOLUSDT",
      entryPrice: 145.23,
      exitPrice: 143.87,
      type: "LONG",
      status: "CLOSED",
      score: 65,
      winRate: 88.5,
      reasoning: "Score 65/100 - Moderate signal, entered on minor pullback (MISSED: Price reversed after news announcement)",
      entryTime: Date.now() - 14400000,
      exitTime: Date.now() - 10800000,
      profit: -0.94,
      dcaCount: 0,
    },
  ]);

  const [performance, setPerformance] = useState({
    totalTrades: 152,
    winRate: 64.5,
    totalProfit: 2847.33,
    avgProfit: 18.73,
    avgLoss: -45.20,
    profitFactor: 2.3,
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: "linear", stops: [
          { stop: 0, color: "#0f172a" },
          { stop: 1, color: "#1e293b" }
        ] },
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

    // Add sample candle data - in production, fetch from Binance API
    const candleData: CandlestickData[] = [
      { time: Date.now() - 86400000, open: 66000, high: 66500, low: 65800, close: 66200 },
      { time: Date.now() - 82800000, open: 66200, high: 66800, low: 66000, close: 66500 },
      { time: Date.now() - 79200000, open: 66500, high: 67000, low: 66300, close: 66800 },
      { time: Date.now() - 75600000, open: 66800, high: 67200, low: 66500, close: 67100 },
      { time: Date.now() - 72000000, open: 67100, high: 67500, low: 66800, close: 67000 },
      { time: Date.now() - 68400000, open: 67000, high: 67400, low: 66700, close: 67300 },
      { time: Date.now() - 64800000, open: 67300, high: 67700, low: 67000, close: 67500 },
      { time: Date.now() - 61200000, open: 67500, high: 67800, low: 67200, close: 67600 },
      { time: Date.now() - 57600000, open: 67600, high: 68000, low: 67300, close: 67800 },
      { time: Date.now() - 54000000, open: 67800, high: 68200, low: 67500, close: 68000 },
      { time: Date.now() - 50400000, open: 68000, high: 68300, low: 67700, close: 67900 },
      { time: Date.now() - 46800000, open: 67900, high: 68200, low: 67500, close: 67700 },
      { time: Date.now() - 43200000, open: 67700, high: 68000, low: 67300, close: 67500 },
      { time: Date.now() - 39600000, open: 67500, high: 67800, low: 67100, close: 67300 },
      { time: Date.now() - 36000000, open: 67300, high: 67600, low: 66900, close: 67200 },
    ];

    candleSeries.setData(candleData);

    // Add markers for trades
    const markers: ChartMarker[] = trades.flatMap((trade) => [
      {
        time: trade.entryTime,
        position: "belowBar" as const,
        color: "#22c55e",
        shape: "arrowUp" as const,
        text: "🌸 ENTER",
      },
      ...(trade.exitTime
        ? [
            {
              time: trade.exitTime,
              position: "aboveBar" as const,
              color: "#ef4444",
              shape: "arrowDown" as const,
              text: "🔴 EXIT",
            } as ChartMarker,
          ]
        : []),
    ]);

    candleSeries.setMarkers(markers);

    chart.timeScale().fitContent();

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartRef.current?.remove();
    };
  }, [trades]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-white mb-2">Trading Dashboard</h1>
            <p className="text-purple-200">Real-time cryptocurrency trading signals powered by ZmartyChat</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-100">Total Trades</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{performance.totalTrades}</p>
            <p className="text-sm text-slate-400">All-time</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-100">Win Rate</h3>
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{performance.winRate}%</p>
            <p className="text-sm text-slate-400">Last 30 days</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-100">Total Profit</h3>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">${performance.totalProfit.toLocaleString()}</p>
            <p className={`text-sm ${performance.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {performance.totalProfit >= 0 ? 'Profitable' : 'Net Loss'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-100">Avg Profit</h3>
              <Percent className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-4xl font-bold mb-1 ${performance.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${performance.avgProfit >= 0 ? '+' : ''}{performance.avgProfit}%
            </p>
            <p className="text-sm text-slate-400">Per trade</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-100">Profit Factor</h3>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-purple-300 mb-1">{performance.profitFactor}:1</p>
            <p className="text-sm text-slate-400">Win/Loss Ratio</p>
          </div>
        </div>

        {/* User Education Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-xl p-6 border border-indigo-700/50 mb-8 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-indigo-300" />
            <h2 className="text-xl font-bold text-white">Understanding Your Trading Signals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-700/30">
              <h3 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Score (0-100)
              </h3>
              <p className="text-sm text-indigo-300 leading-relaxed">
                Signal strength from ZmartyChat's 16 technical indicators. 
                Higher scores = stronger conviction. Scores above 75 indicate high-probability setups.
              </p>
            </div>

            <div className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-700/30">
              <h3 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Win Rate (%)
              </h3>
              <p className="text-sm text-indigo-300 leading-relaxed">
                Historical accuracy for similar signals. A 90%+ win rate on scores above 80 has proven reliable. 
                Win rate below 60% requires additional confirmation.
              </p>
            </div>

            <div className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-700/30">
              <h3 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Risk:Reward Ratio
              </h3>
              <p className="text-sm text-indigo-300 leading-relaxed">
                Target profit vs stop loss. Minimum 2:1 R:R required. 
                Higher ratios (3:1, 4:1) offer better risk-adjusted returns.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100">Live Price Chart</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-slate-400">Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-400">Exit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-slate-400">DCA</span>
                </div>
              </div>
            </div>
            <div ref={chartContainerRef} className="w-full h-[400px]" />
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Real-time Binance WebSocket data (production) | Sample data (demo)</span>
            </div>
          </div>

          {/* Trade List Section */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 border border-slate-600/30 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100">Recent Trades</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Showing {trades.length} trades</span>
                <span>• Live updates via ZmartyChat API</span>
              </div>
            </div>

            <div className="space-y-3">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={`p-4 rounded-lg border transition-all hover:border-purple-500/50 ${
                    trade.status === "OPEN"
                      ? "bg-green-900/20 border-green-500/30"
                      : trade.status === "CLOSED"
                      ? "bg-slate-800/50 border-slate-700/30"
                      : "bg-yellow-900/20 border-yellow-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trade.type === "LONG"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {trade.type}
                      </div>
                      <span className="font-semibold text-slate-100">{trade.symbol}</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        Score: {trade.score}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Entry:</span>{" "}
                      <span className="font-semibold text-slate-100">${trade.entryPrice.toLocaleString()}</span>
                    </div>
                    {trade.exitPrice && (
                      <div>
                        <span className="text-slate-400">Exit:</span>{" "}
                        <span className="font-semibold text-slate-100">${trade.exitPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {trade.profit !== undefined && (
                      <div className={trade.profit > 0 ? "text-green-400" : "text-red-400"}>
                        <span className="text-slate-400">P&L:</span>{" "}
                        <span className="font-semibold">{trade.profit > 0 ? "+" : ""}{trade.profit}%</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">WR:</span>{" "}
                      <span className="font-semibold text-purple-300">{trade.winRate}%</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-950/50 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {trade.status === "OPEN" && <ArrowUp className="w-4 h-4 text-green-400" />}
                        {trade.status === "CLOSED" && <ArrowDown className="w-4 h-4 text-red-400" />}
                        {trade.status === "DCA" && <Circle className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300 leading-relaxed">{trade.reasoning}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4" />
            <span>Powered by ZmartyChat • 16 Technical Indicators</span>
          </div>
          <p>Real-time signals • Multi-timeframe analysis • Risk management</p>
        </div>
      </div>
    </div>
  );
}
