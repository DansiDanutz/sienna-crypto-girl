"use client";

import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

import { fetchBinanceCandles, usePollingQuery } from "@/lib/live-data";

export function useLiveCandles(symbol = "BTCUSDT", interval = "1h", limit = 24) {
  const { data, loading, error, refetch } = usePollingQuery<CandlestickData<UTCTimestamp>[]>(
    [],
    async () => fetchBinanceCandles(symbol, interval, limit),
    300_000,
  );

  return {
    candles: data,
    loading,
    error,
    refetch,
  };
}
