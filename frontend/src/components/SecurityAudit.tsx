'use client'
// Security Audit System — API key scanner, env checks, anomaly alerts

import { useState } from 'react'
import { Shield, ShieldCheck, ShieldAlert, ShieldOff, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface SecurityCheck {
  id: string
  category: string
  name: string
  status: 'pass' | 'warning' | 'fail'
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SecurityAuditResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: SecurityCheck[]
  criticalCount: number
  warningCount: number
  passCount: number
  recommendations: string[]
  timestamp: number
}

const gradeColor: Record<string, string> = {
  A: 'text-green-400', B: 'text-blue-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400'
}
const gradeBg: Record<string, string> = {
  A: 'bg-green-900/30 border-green-500/30', B: 'bg-blue-900/30 border-blue-500/30',
  C: 'bg-yellow-900/30 border-yellow-500/30', D: 'bg-orange-900/30 border-orange-500/30',
  F: 'bg-red-900/30 border-red-500/30',
}

const statusIcon = {
  pass:    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />,
  warning: <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />,
  fail:    <XCircle     className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />,
}

const categoryIcon: Record<string, string> = {
  'api-keys': '🔑', 'access-control': '🔒', 'data-protection': '🛡️', 'network': '🌐', 'dependencies': '📦'
}

export default function SecurityAudit() {
  const [result, setResult] = useState<SecurityAuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function runAudit() {
    setLoading(true)
    try {
      const res = await fetch('/api/security/audit')
      setResult(await res.json())
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const categories = result
    ? [...new Set(result.checks.map(c => c.category))]
    : []

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🔐</span> Security Audit
        </h2>
        {result && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-bold ${gradeBg[result.grade]}`}>
            <ShieldCheck className={`w-3 h-3 ${gradeColor[result.grade]}`} />
            <span className={gradeColor[result.grade]}>Grade {result.grade} · {result.score}/100</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={runAudit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Audit…' : result ? 'Re-run Audit' : 'Run Security Audit'}
        </button>

        {!result && !loading && (
          <div className="text-center py-6 text-slate-500 text-xs">
            Run an audit to check API key exposure, network security, and more
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Score cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                <div className="text-lg font-bold text-green-400">{result.passCount}</div>
                <div className="text-[10px] text-green-400">Passed</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3">
                <div className="text-lg font-bold text-yellow-400">{result.warningCount}</div>
                <div className="text-[10px] text-yellow-400">Warnings</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                <div className="text-lg font-bold text-red-400">{result.criticalCount}</div>
                <div className="text-[10px] text-red-400">Critical</div>
              </div>
            </div>

            {/* Checks by category */}
            {categories.map(cat => {
              const checks = result.checks.filter(c => c.category === cat)
              const isOpen = expanded === cat
              return (
                <div key={cat} className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : cat)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <span>{categoryIcon[cat] ?? '🔍'}</span>
                      <span className="capitalize">{cat.replace('-', ' ')}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {checks.filter(c => c.status === 'fail').length > 0 && (
                        <span className="text-[10px] text-red-400 font-semibold">
                          {checks.filter(c => c.status === 'fail').length} fail
                        </span>
                      )}
                      {checks.filter(c => c.status === 'warning').length > 0 && (
                        <span className="text-[10px] text-yellow-400 font-semibold">
                          {checks.filter(c => c.status === 'warning').length} warn
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-white/5">
                      {checks.map(c => (
                        <div key={c.id} className="flex items-start gap-2.5 px-3 py-2.5">
                          {statusIcon[c.status]}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200">{c.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{c.details}</div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ${
                            c.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                            c.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                            c.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-slate-700/50 text-slate-400'
                          }`}>{c.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Recommendations</div>
                {result.recommendations.map((r, i) => (
                  <div key={i} className="text-[10px] text-slate-300 bg-slate-800/50 rounded px-2.5 py-2">
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
