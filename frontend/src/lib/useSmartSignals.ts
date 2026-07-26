"use client";

import { fetchJson, normalizeSmartSignal, type SmartSignal, usePollingQuery } from "@/lib/live-data";

export function useSmartSignals() {
  const { data, loading, error, refetch } = usePollingQuery<SmartSignal[]>(
    [],
    async () => {
      const response = await fetchJson<unknown[]>("/api/signals/smart");
      return response
        .map((signal, index) => normalizeSmartSignal(signal, index))
        .filter((signal): signal is SmartSignal => signal !== null);
    },
    120_000,
  );

  return {
    signals: data,
    loading,
    error,
    refetch,
  };
}
