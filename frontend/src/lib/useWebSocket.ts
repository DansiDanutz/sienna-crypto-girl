'use client'
// WebSocket Data Streams — real-time price feed hook

import { useState, useEffect, useRef, useCallback } from 'react'

export interface TickerPrice {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

type WsState = 'connecting' | 'connected' | 'disconnected' | 'error'

// Binance WebSocket streams (public, no auth needed)
const WS_BASE = 'wss://stream.binance.com:9443/stream'

function toBinanceSymbol(symbol: string): string {
  const s = symbol.toUpperCase()
  if (s.endsWith('USDT') || s.endsWith('BTC') || s.endsWith('ETH')) return s.toLowerCase()
  return `${s.toLowerCase()}usdt`
}

export function useTickerStream(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, TickerPrice>>({})
  const [wsState, setWsState] = useState<WsState>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)

  const connect = useCallback(() => {
    if (!symbols.length || typeof window === 'undefined') return
    if (wsRef.current) wsRef.current.close()

    const streams = symbols.map(s => `${toBinanceSymbol(s)}@ticker`).join('/')
    const url = `${WS_BASE}?streams=${streams}`

    setWsState('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => { if (isMounted.current) setWsState('connected') }

    ws.onmessage = (e) => {
      if (!isMounted.current) return
      try {
        const msg = JSON.parse(e.data) as { stream: string; data: BinanceTicker }
        const t = msg.data
        const symbol = t.s.replace('USDT', '').replace('BTC', '_BTC').replace('ETH', '_ETH')
        const ticker: TickerPrice = {
          symbol,
          price: parseFloat(t.c),
          change24h: parseFloat(t.P),
          changePercent24h: parseFloat(t.P),
          volume24h: parseFloat(t.v) * parseFloat(t.c),
          high24h: parseFloat(t.h),
          low24h: parseFloat(t.l),
          timestamp: t.T,
        }
        setPrices(prev => ({ ...prev, [symbol]: ticker }))
      } catch { /* malformed */ }
    }

    ws.onclose = () => {
      if (!isMounted.current) return
      setWsState('disconnected')
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      if (!isMounted.current) return
      setWsState('error')
    }
  }, [symbols.join(',')])  // eslint-disable-line

  useEffect(() => {
    isMounted.current = true
    connect()
    return () => {
      isMounted.current = false
      wsRef.current?.close()
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
    }
  }, [connect])

  return { prices, wsState }
}

interface BinanceTicker {
  s: string   // symbol
  c: string   // last price
  P: string   // price change %
  v: string   // base volume
  h: string   // high
  l: string   // low
  T: number   // timestamp
}

// Fallback mock prices for SSR / when WS unavailable
export const MOCK_PRICES: Record<string, TickerPrice> = {
  BTC:  { symbol: 'BTC',  price: 67234.50, change24h: 2.3,  changePercent24h: 2.3,  volume24h: 28_450_000_000, high24h: 68100, low24h: 65800, timestamp: Date.now() },
  ETH:  { symbol: 'ETH',  price: 3456.78,  change24h: 3.1,  changePercent24h: 3.1,  volume24h: 14_200_000_000, high24h: 3520,  low24h: 3380,  timestamp: Date.now() },
  SOL:  { symbol: 'SOL',  price: 145.23,   change24h: -1.2, changePercent24h: -1.2, volume24h: 2_100_000_000,  high24h: 150,   low24h: 141,   timestamp: Date.now() },
  BNB:  { symbol: 'BNB',  price: 420.50,   change24h: 0.8,  changePercent24h: 0.8,  volume24h: 890_000_000,   high24h: 428,   low24h: 415,   timestamp: Date.now() },
  AVAX: { symbol: 'AVAX', price: 38.20,    change24h: 4.2,  changePercent24h: 4.2,  volume24h: 450_000_000,   high24h: 40,    low24h: 36.5,  timestamp: Date.now() },
}
