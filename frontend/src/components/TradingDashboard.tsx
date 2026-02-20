"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { ArrowUp, ArrowDown, Circle, Clock, DollarSign, Percent } from "lucide-react";

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
      entryTime: Date.now() - 3600000, // 1 hour ago
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

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: "solid", color: "#0f172a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
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

    // Add sample candle data (in real app, fetch from API)
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

  return (
    <div className="space-y-6 fade-in">
      {/* Chart */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">BTCUSDT - 1h</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Entry: 🌸</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Exit: 🔴</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>DCA: 💰</span>
            </div>
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>

      {/* Trade List */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
        <div className="space-y-3">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className={`p-4 rounded-lg border transition-all hover:border-primary/50 ${
                trade.status === "OPEN"
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-slate-800/50 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
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
                  <span className="font-semibold">{trade.symbol}</span>
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
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
                  <span className="text-muted-foreground">Entry:</span>{" "}
                  <span className="font-semibold">${trade.entryPrice.toLocaleString()}</span>
                </div>
                {trade.exitPrice && (
                  <div>
                    <span className="text-muted-foreground">Exit:</span>{" "}
                    <span className="font-semibold">${trade.exitPrice.toLocaleString()}</span>
                  </div>
                )}
                {trade.profit !== undefined && (
                  <div className={trade.profit > 0 ? "text-green-400" : "text-red-400"}>
                    <span className="text-muted-foreground">P&L:</span>{" "}
                    <span className="font-semibold">{trade.profit > 0 ? "+" : ""}{trade.profit}%</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">WR:</span>{" "}
                  <span className="font-semibold text-purple-400">{trade.winRate}%</span>
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
                    <p className="text-muted-foreground">{trade.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
