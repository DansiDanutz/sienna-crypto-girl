'use client'
// Pattern Recognition ML — chart pattern detector (H&S, double top/bottom, flags, etc.)

import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DetectedPattern {
  name: string
  label: string
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  winRate: number
  priceTarget: number
  invalidationLevel: number
  description: string
  strength: 'weak' | 'moderate' | 'strong'
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'XRP', 'DOGE']

const dirColor = {
  bullish: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500/30', icon: TrendingUp },
  bearish: { text: 'text-red-400',   bg: 'bg-red-900/30',   border: 'border-red-500/30',   icon: TrendingDown },
  neutral: { text: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-white/10',      icon: Minus },
}

const strengthDot = {
  weak:     'bg-slate-500',
  moderate: 'bg-yellow-400',
  strong:   'bg-green-400',
}

export default function PatternScanner() {
  const [symbol, setSymbol] = useState('BTC')
  const [patterns, setPatterns] = useState<DetectedPattern[]>([])
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)

  async function scan() {
    setLoading(true)
    setScanned(false)
    try {
      const res = await fetch('/api/patterns/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, currentPrice: 67000, candles: [] }),
      })
      const data = await res.json()
      setPatterns(data.patterns ?? [])
    } catch {
      setPatterns([])
    } finally {
      setLoading(false)
      setScanned(true)
    }
  }

  const bullish = patterns.filter(p => p.direction === 'bullish')
  const bearish  = patterns.filter(p => p.direction === 'bearish')

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🔍</span> Pattern Scanner
        </h2>
        {scanned && (
          <span className="text-xs text-slate-400">
            {bullish.length} bullish · {bearish.length} bearish
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex gap-2">
          <div className="flex gap-1 flex-wrap flex-1">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  symbol === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={scan}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Scanning…' : 'Scan'}
          </button>
        </div>

        {/* Results */}
        {!scanned && !loading && (
          <div className="text-center py-8 text-slate-500 text-xs">
            Select a symbol and click Scan to detect chart patterns
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-slate-400 text-xs animate-pulse">
            Analyzing {symbol} chart patterns…
          </div>
        )}

        {scanned && patterns.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No significant patterns detected — market structure unclear
          </div>
        )}

        {scanned && patterns.length > 0 && (
          <div className="space-y-2">
            {patterns.map((p, i) => {
              const dc = dirColor[p.direction]
              const Icon = dc.icon
              return (
                <div
                  key={i}
                  className={`${dc.bg} border ${dc.border} rounded-lg px-3 py-3`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${dc.text}`} />
                      <div>
                        <span className={`text-xs font-bold ${dc.text}`}>{p.label}</span>
                        <span className="text-[10px] text-slate-500 ml-2 capitalize">{p.direction}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${dc.text}`}>{p.confidence}% conf</div>
                      <div className="text-[10px] text-slate-500">{p.winRate}% WR</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-2">{p.description}</p>

                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div className="text-slate-500">Target</div>
                      <div className="text-green-400 font-semibold">${p.priceTarget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Invalidation</div>
                      <div className="text-red-400 font-semibold">${p.invalidationLevel.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Strength</div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${strengthDot[p.strength]}`} />
                        <span className="text-slate-300 capitalize">{p.strength}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
