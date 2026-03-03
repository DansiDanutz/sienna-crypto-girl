'use client'
// Portfolio Rebalancing AI — strategy picker + trade suggestions

import { useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, ChevronRight, AlertCircle } from 'lucide-react'
import { DEMO_HOLDINGS } from '@/lib/portfolio'

type Strategy = 'equal-weight' | 'momentum' | 'risk-parity'

interface RebalanceTrade {
  symbol: string
  action: 'BUY' | 'SELL' | 'HOLD'
  currentValue: number
  targetValue: number
  delta: number
  deltaPercent: number
  urgency: 'low' | 'medium' | 'high'
  reason: string
}

interface RebalanceResult {
  strategy: Strategy
  totalValue: number
  trades: RebalanceTrade[]
  projectedReturn: number
  riskScore: number
  aiInsight: string
  timestamp: number
}

function fmtUSD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

const STRATEGIES: { id: Strategy; label: string; desc: string }[] = [
  { id: 'equal-weight',  label: 'Equal Weight',  desc: 'Distribute evenly across all assets' },
  { id: 'momentum',      label: 'Momentum',       desc: 'Overweight top performers' },
  { id: 'risk-parity',   label: 'Risk Parity',    desc: 'Weight by inverse volatility' },
]

const urgencyColor = { low: 'text-slate-400', medium: 'text-yellow-400', high: 'text-red-400' }
const urgencyBg   = { low: 'bg-slate-800',    medium: 'bg-yellow-900/30', high: 'bg-red-900/30' }

export default function PortfolioRebalancer() {
  const [strategy, setStrategy] = useState<Strategy>('equal-weight')
  const [result, setResult] = useState<RebalanceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings: DEMO_HOLDINGS, strategy }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResult(await res.json())
    } catch (e) {
      setError('Could not fetch rebalance data. Using demo mode.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">⚖️</span> Portfolio Rebalancer
        </h2>
        <span className="text-xs text-purple-400 font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
          AI Strategy
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Strategy picker */}
        <div className="grid grid-cols-3 gap-2">
          {STRATEGIES.map(s => (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={`text-left p-3 rounded-lg border text-xs transition-all ${
                strategy === s.id
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20'
              }`}
            >
              <div className="font-semibold mb-0.5">{s.label}</div>
              <div className="text-[10px] opacity-70">{s.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing…' : 'Run Rebalance Analysis'}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 mb-1">Portfolio Value</div>
                <div className="text-sm font-bold text-white">{fmtUSD(result.totalValue)}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 mb-1">Projected Return</div>
                <div className={`text-sm font-bold ${result.projectedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.projectedReturn >= 0 ? '+' : ''}{result.projectedReturn.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 mb-1">Risk Score</div>
                <div className={`text-sm font-bold ${result.riskScore < 40 ? 'text-green-400' : result.riskScore < 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {result.riskScore}/100
                </div>
              </div>
            </div>

            {/* AI Insight */}
            {result.aiInsight && (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3 text-xs text-purple-200">
                <div className="text-purple-400 font-semibold mb-1">🤖 AI Insight</div>
                {result.aiInsight}
              </div>
            )}

            {/* Trades */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Suggested Trades</div>
              {result.trades.slice(0, 6).map(trade => (
                <div
                  key={trade.symbol}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 ${urgencyBg[trade.urgency]}`}
                >
                  <div className={`text-xs font-bold w-6 ${trade.action === 'BUY' ? 'text-green-400' : trade.action === 'SELL' ? 'text-red-400' : 'text-slate-400'}`}>
                    {trade.action === 'BUY' ? <TrendingUp className="w-4 h-4" /> : trade.action === 'SELL' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{trade.symbol}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${trade.action === 'BUY' ? 'bg-green-900/50 text-green-400' : trade.action === 'SELL' ? 'bg-red-900/50 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        {trade.action}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{trade.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${trade.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.delta >= 0 ? '+' : ''}{fmtUSD(trade.delta)}
                    </div>
                    <div className={`text-[10px] ${urgencyColor[trade.urgency]}`}>{trade.urgency}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-6 text-slate-500 text-xs">
            Select a strategy and run analysis to see rebalancing suggestions
          </div>
        )}
      </div>
    </div>
  )
}
