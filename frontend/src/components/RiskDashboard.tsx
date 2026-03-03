'use client'
// Dynamic Risk Management — position sizing, stop-loss, ATR-based risk dashboard

import { useState } from 'react'
import { Shield, AlertTriangle, Calculator, ChevronDown, ChevronUp } from 'lucide-react'

interface PositionSize {
  symbol: string
  units: number
  dollarRisk: number
  stopLoss: number
  takeProfit: number
  riskRewardRatio: number
  kellyCriterion: number
  entryPrice: number
}

interface RiskAlert {
  type: 'overexposed' | 'drawdown' | 'volatile' | 'correlation' | 'size'
  level: 'warning' | 'critical'
  message: string
}

interface RiskResult {
  position: PositionSize
  alerts: RiskAlert[]
  profile: { maxPositionSize: number; stopLossMultiplier: number; takeProfitMultiplier: number }
}

const levelColor = { warning: 'text-yellow-400', critical: 'text-red-400' }
const levelBg    = { warning: 'bg-yellow-900/30 border-yellow-500/30', critical: 'bg-red-900/30 border-red-500/30' }

export default function RiskDashboard() {
  const [form, setForm] = useState({ balance: 10000, entry: 67000, atr: 1200, symbol: 'BTC', positions: 2, drawdown: 5 })
  const [result, setResult] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: k === 'symbol' ? v : parseFloat(v) || 0 }))
  }

  async function calculate() {
    setLoading(true)
    try {
      const res = await fetch('/api/risk/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountBalance: form.balance,
          entryPrice: form.entry,
          atr: form.atr,
          symbol: form.symbol,
          openPositions: form.positions,
          drawdown: form.drawdown,
          volatility: (form.atr / form.entry) * 100,
          correlationRisk: 0.4,
        }),
      })
      setResult(await res.json())
    } catch {
      // demo fallback
      setResult({
        position: {
          symbol: form.symbol,
          units: parseFloat(((form.balance * 0.01) / (form.atr * 2)).toFixed(6)),
          dollarRisk: form.balance * 0.01,
          stopLoss: form.entry - form.atr * 2,
          takeProfit: form.entry + form.atr * 4,
          riskRewardRatio: 2.0,
          kellyCriterion: 0.25,
          entryPrice: form.entry,
        },
        alerts: form.drawdown > 10 ? [{ type: 'drawdown', level: 'critical', message: 'Drawdown exceeds 10% — reduce position sizes' }] : [],
        profile: { maxPositionSize: 0.05, stopLossMultiplier: 2, takeProfitMultiplier: 4 },
      })
    } finally {
      setLoading(false)
    }
  }

  const p = result?.position

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🛡️</span> Risk Manager
        </h2>
        <div className="flex items-center gap-2">
          {result && result.alerts.length > 0 && (
            <span className="text-xs text-red-400 font-semibold bg-red-900/30 px-2 py-0.5 rounded-full border border-red-500/30">
              {result.alerts.length} alert{result.alerts.length > 1 ? 's' : ''}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: 'symbol', label: 'Symbol', type: 'text' },
              { key: 'balance', label: 'Account ($)', type: 'number' },
              { key: 'entry', label: 'Entry Price', type: 'number' },
              { key: 'atr', label: 'ATR (14)', type: 'number' },
              { key: 'positions', label: 'Open Positions', type: 'number' },
              { key: 'drawdown', label: 'Drawdown %', type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-[10px] text-slate-400 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => set(key as keyof typeof form, e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Calculator className="w-4 h-4" />
            {loading ? 'Calculating…' : 'Calculate Position Size'}
          </button>

          {/* Alerts */}
          {result && result.alerts.length > 0 && (
            <div className="space-y-2">
              {result.alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${levelBg[a.level]}`}>
                  <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${levelColor[a.level]}`} />
                  <span className={levelColor[a.level]}>{a.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Result */}
          {p && (
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Position Sizing — {p.symbol} @ ${p.entryPrice.toLocaleString()}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Units', value: p.units.toFixed(6), color: 'text-white' },
                  { label: 'Dollar Risk', value: `$${p.dollarRisk.toFixed(0)}`, color: 'text-orange-400' },
                  { label: 'Stop Loss', value: `$${p.stopLoss.toFixed(0)}`, color: 'text-red-400' },
                  { label: 'Take Profit', value: `$${p.takeProfit.toFixed(0)}`, color: 'text-green-400' },
                  { label: 'R:R Ratio', value: `1:${p.riskRewardRatio.toFixed(1)}`, color: 'text-blue-400' },
                  { label: 'Kelly %', value: `${(p.kellyCriterion * 100).toFixed(0)}%`, color: 'text-purple-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-700/50 rounded p-2">
                    <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
                    <div className={`text-sm font-bold ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                Risk 1% of {form.balance.toLocaleString()} = ${p.dollarRisk.toFixed(0)} · ATR×2 stop = {p.stopLoss.toFixed(0)} · ATR×4 target = {p.takeProfit.toFixed(0)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
