"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export interface Trade {
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

export interface Stats {
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  maxDrawdown: number;
  totalProfit: number;
  currentPositions: number;
}

export interface SmartSignal {
  id: string;
  symbol: string;
  direction: string;
  score: number | null;
  winRate: number | null;
  timeframe: string | null;
  reasoning: string;
}

type QueryResult<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseTimestamp(value: unknown): number | null {
  const parsed = parseNumber(value);
  if (parsed === null) return null;
  return parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
}

export function toChartTime(value: number): UTCTimestamp {
  const milliseconds = value > 1_000_000_000_000 ? value : value * 1000;
  return Math.floor(milliseconds / 1000) as UTCTimestamp;
}

export function getLiveApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export function getLiveApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getLiveApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: string; error?: string; message?: string };
    return payload.detail ?? payload.error ?? payload.message ?? `Request failed with ${response.status}`;
  } catch {
    return `Request failed with ${response.status}`;
  }
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getLiveApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function fetchBinanceCandles(symbol: string, interval: string, limit: number) {
  const endpoint = new URL("https://api.binance.com/api/v3/klines");
  endpoint.searchParams.set("symbol", symbol);
  endpoint.searchParams.set("interval", interval);
  endpoint.searchParams.set("limit", String(limit));

  const raw = (await fetchJson<unknown[][]>(endpoint.toString())) ?? [];
  return raw
    .map((entry) => {
      const openTime = parseNumber(entry[0]);
      const open = parseNumber(entry[1]);
      const high = parseNumber(entry[2]);
      const low = parseNumber(entry[3]);
      const close = parseNumber(entry[4]);

      if (
        openTime === null ||
        open === null ||
        high === null ||
        low === null ||
        close === null
      ) {
        return null;
      }

      return {
        time: toChartTime(openTime * 1000),
        open,
        high,
        low,
        close,
      } satisfies CandlestickData<UTCTimestamp>;
    })
    .filter((entry): entry is CandlestickData<UTCTimestamp> => entry !== null);
}

export function normalizeTrade(raw: unknown, index: number): Trade | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const symbol = typeof item.symbol === "string" ? item.symbol : null;
  const entryPrice = parseNumber(item.entryPrice);
  const entryTime = parseTimestamp(item.entryTime);

  if (!symbol || entryPrice === null || entryTime === null) {
    return null;
  }

  const exitPrice = parseNumber(item.exitPrice) ?? undefined;
  const exitTime = parseTimestamp(item.exitTime) ?? undefined;
  const profit = parseNumber(item.profit) ?? undefined;
  const score = parseNumber(item.score) ?? 0;
  const winRate = parseNumber(item.winRate) ?? 0;
  const dcaCount = parseNumber(item.dcaCount) ?? undefined;
  const tradeType = item.type === "SHORT" ? "SHORT" : "LONG";
  const tradeStatus =
    item.status === "OPEN" || item.status === "CLOSED" || item.status === "DCA" ? item.status : "OPEN";

  return {
    id: typeof item.id === "string" ? item.id : `${symbol}-${index}`,
    symbol,
    entryPrice,
    exitPrice,
    type: tradeType,
    status: tradeStatus,
    score,
    winRate,
    reasoning: typeof item.reasoning === "string" ? item.reasoning : "No reasoning provided yet.",
    entryTime,
    exitTime,
    profit,
    dcaCount,
  };
}

export function normalizeStats(raw: unknown): Stats {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    winRate: parseNumber(item.winRate) ?? 0,
    totalTrades: parseNumber(item.totalTrades) ?? 0,
    profitFactor: parseNumber(item.profitFactor) ?? 0,
    maxDrawdown: parseNumber(item.maxDrawdown) ?? 0,
    totalProfit: parseNumber(item.totalProfit) ?? 0,
    currentPositions: parseNumber(item.currentPositions) ?? 0,
  };
}

export function normalizeSmartSignal(raw: unknown, index: number): SmartSignal | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const symbol = typeof item.symbol === "string" ? item.symbol : null;
  if (!symbol) return null;

  const directionValue =
    typeof item.direction === "string"
      ? item.direction
      : typeof item.type === "string"
        ? item.type
        : typeof item.side === "string"
          ? item.side
          : typeof item.signal === "string"
            ? item.signal
            : "Signal";

  const reasoningValue =
    typeof item.reasoning === "string"
      ? item.reasoning
      : typeof item.summary === "string"
        ? item.summary
        : typeof item.message === "string"
          ? item.message
          : "High-conviction setup from smart signal filter.";

  return {
    id: typeof item.id === "string" ? item.id : `${symbol}-${index}`,
    symbol,
    direction: directionValue,
    score: parseNumber(item.score),
    winRate: parseNumber(item.winRate) ?? parseNumber(item.wr),
    timeframe:
      typeof item.timeframe === "string"
        ? item.timeframe
        : typeof item.tf === "string"
          ? item.tf
          : null,
    reasoning: reasoningValue,
  };
}

export function usePollingQuery<T>(
  initialData: T,
  query: () => Promise<T>,
  intervalMs: number,
): QueryResult<T> {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const runQuery = useCallback(async () => {
    if (!mountedRef.current) return;

    setError(null);
    try {
      const next = await query();
      if (!mountedRef.current) return;
      setData(next);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load live data.");
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [query]);

  useEffect(() => {
    mountedRef.current = true;
    void runQuery();

    const intervalId = window.setInterval(() => {
      void runQuery();
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [intervalMs, runQuery]);

  return {
    data,
    loading,
    error,
    refetch: runQuery,
  };
}
