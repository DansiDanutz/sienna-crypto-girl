"use client";

import { fetchJson, normalizeTrade, type Trade, usePollingQuery } from "@/lib/live-data";

export function useLiveTrades(limit = 20) {
  const { data, loading, error, refetch } = usePollingQuery<Trade[]>(
    [],
    async () => {
      const response = await fetchJson<unknown[]>(`/api/trades?limit=${limit}`);
      return response
        .map((trade, index) => normalizeTrade(trade, index))
        .filter((trade): trade is Trade => trade !== null);
    },
    60_000,
  );

  return {
    trades: data,
    loading,
    error,
    refetch,
  };
}
