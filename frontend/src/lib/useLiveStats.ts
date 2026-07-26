"use client";

import { fetchJson, normalizeStats, type Stats, usePollingQuery } from "@/lib/live-data";

const EMPTY_STATS: Stats = {
  winRate: 0,
  totalTrades: 0,
  profitFactor: 0,
  maxDrawdown: 0,
  totalProfit: 0,
  currentPositions: 0,
};

export function useLiveStats() {
  const { data, loading, error, refetch } = usePollingQuery<Stats>(
    EMPTY_STATS,
    async () => normalizeStats(await fetchJson<unknown>("/api/stats")),
    60_000,
  );

  return {
    stats: data,
    loading,
    error,
    refetch,
  };
}
