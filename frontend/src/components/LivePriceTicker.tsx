'use client'
// WebSocket Data Streams — real-time Binance ticker

import { useTickerStream, MOCK_PRICES } from '@/lib/useWebSocket'
import { TrendingUp, TrendingDown, Wifi, WifiOff, Loader2 } from 'lucide-react'

const TRACKED = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX']

function fmtPrice(p: number) {
  return p >= 1000
    ? `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `$${p.toFixed(2)}`
}

function fmtVol(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toFixed(0)}`
}

export default function LivePriceTicker() {
  const { prices, wsState } = useTickerStream(TRACKED)

  // Merge live + mock fallback
  const display = TRACKED.map(sym => prices[sym] ?? MOCK_PRICES[sym])

  const statusIcon = {
    connecting: <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />,
    connected:  <Wifi className="w-3 h-3 text-green-400" />,
    disconnected: <WifiOff className="w-3 h-3 text-slate-400" />,
    error:      <WifiOff className="w-3 h-3 text-red-400" />,
  }[wsState]

  const statusLabel = {
    connecting: 'Connecting…',
    connected:  'Live',
    disconnected: 'Disconnected',
    error: 'Error',
  }[wsState]

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">📡</span> Live Prices
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {statusIcon}
          <span>{statusLabel} · Binance</span>
        </div>
      </div>

      {/* Ticker grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/5">
        {display.map(t => {
          if (!t) return null
          const up = t.changePercent24h >= 0
          return (
            <div key={t.symbol} className="bg-slate-900/80 px-4 py-3 hover:bg-slate-800/80 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-300">{t.symbol}</span>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {up ? '+' : ''}{t.changePercent24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-base font-bold text-white mb-1">{fmtPrice(t.price)}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>H: {fmtPrice(t.high24h)}</span>
                <span>L: {fmtPrice(t.low24h)}</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Vol {fmtVol(t.volume24h)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
