'use client'
// NLP Sentiment Engine — news/social sentiment with XAI Grok

import { useState } from 'react'
import { MessageSquare, BarChart3, Loader2 } from 'lucide-react'

interface SentimentReport {
  symbol: string
  overallScore: number
  overallLabel: string
  confidence: number
  newsCount: number
  bullishCount: number
  bearishCount: number
  neutralCount: number
  fearGreedIndex: number
  socialVolume: number
  trend: 'improving' | 'deteriorating' | 'stable'
  aiSummary: string
  topBullishHeadlines: string[]
  timestamp: number
}

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX']

const SAMPLE_HEADLINES: Record<string, string[]> = {
  BTC: [
    'Bitcoin surges past $68K as institutional demand grows',
    'MicroStrategy adds 10,000 BTC to treasury holdings',
    'BlackRock ETF records $500M inflow in single day',
    'Bitcoin mining difficulty hits all-time high',
    'SEC approves two new spot Bitcoin ETF products',
  ],
  ETH: [
    'Ethereum staking rewards hit 6-month high',
    'Layer 2 transactions surpass 3 million daily',
    'ETH supply continues deflationary trend post-merge',
    'DeFi TVL surges to $80B driven by Ethereum protocols',
    'Vitalik unveils new Ethereum scaling roadmap',
  ],
  SOL: [
    'Solana network processes 50,000 TPS in stress test',
    'Major DEX migrates to Solana citing lower fees',
    'Solana phone 2 sells out within 24 hours of launch',
    'Institutional interest in SOL doubles year-over-year',
  ],
  BNB: [
    'BNB Chain records 2M+ daily active users',
    'Binance announces $1B builder fund for BNB ecosystem',
  ],
  AVAX: [
    'Avalanche subnet surpasses 500 custom blockchains',
    'AVAX gaming ecosystem explodes with new titles',
  ],
}

function scoreColor(score: number) {
  if (score > 0.3)  return 'text-green-400'
  if (score > 0)    return 'text-emerald-400'
  if (score > -0.3) return 'text-yellow-400'
  return 'text-red-400'
}

function fearGreedLabel(n: number) {
  if (n >= 80) return { label: 'Extreme Greed', color: 'text-red-400' }
  if (n >= 60) return { label: 'Greed', color: 'text-orange-400' }
  if (n >= 40) return { label: 'Neutral', color: 'text-yellow-400' }
  if (n >= 20) return { label: 'Fear', color: 'text-blue-400' }
  return { label: 'Extreme Fear', color: 'text-purple-400' }
}

export default function SentimentEngine() {
  const [symbol, setSymbol] = useState('BTC')
  const [report, setReport] = useState<SentimentReport | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyze() {
    setLoading(true)
    try {
      const headlines = SAMPLE_HEADLINES[symbol] ?? []
      const res = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, headlines }),
      })
      setReport(await res.json())
    } catch {
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const fg = report ? fearGreedLabel(report.fearGreedIndex) : null

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="text-lg">🧠</span> Sentiment Engine
        </h2>
        <span className="text-xs text-slate-400">Powered by Grok AI</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Symbol + Analyze */}
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 flex-wrap flex-1">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  symbol === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={analyze}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>

        {!report && !loading && (
          <div className="text-center py-6 text-slate-500 text-xs">
            Select a token and analyze to see sentiment report
          </div>
        )}

        {report && (
          <div className="space-y-3">
            {/* Score row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-400 mb-1">Sentiment</div>
                <div className={`text-base font-bold ${scoreColor(report.overallScore)}`}>
                  {report.overallScore >= 0 ? '+' : ''}{(report.overallScore * 100).toFixed(0)}
                </div>
                <div className={`text-[10px] font-semibold ${scoreColor(report.overallScore)} capitalize`}>
                  {report.overallLabel.replace('_', ' ')}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-400 mb-1">Fear & Greed</div>
                <div className={`text-base font-bold ${fg?.color ?? 'text-white'}`}>{report.fearGreedIndex}</div>
                <div className={`text-[10px] font-semibold ${fg?.color ?? ''}`}>{fg?.label}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-400 mb-1">Confidence</div>
                <div className="text-base font-bold text-white">{report.confidence}%</div>
                <div className="text-[10px] text-slate-400 capitalize">{report.trend}</div>
              </div>
            </div>

            {/* Breakdown bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>🟢 Bullish {report.bullishCount}</span>
                <span>⚪ Neutral {report.neutralCount}</span>
                <span>🔴 Bearish {report.bearishCount}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(report.bullishCount / report.newsCount) * 100}%` }}
                />
                <div
                  className="bg-slate-600 transition-all"
                  style={{ width: `${(report.neutralCount / report.newsCount) * 100}%` }}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(report.bearishCount / report.newsCount) * 100}%` }}
                />
              </div>
            </div>

            {/* AI Summary */}
            {report.aiSummary && (
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-3 text-xs text-purple-200">
                <div className="text-purple-400 font-semibold mb-1">🤖 Grok Analysis</div>
                {report.aiSummary}
              </div>
            )}

            {/* Top headlines */}
            {report.topBullishHeadlines.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" /> Top Headlines
                </div>
                {report.topBullishHeadlines.map((h, i) => (
                  <div key={i} className="text-[10px] text-slate-300 bg-slate-800/50 rounded px-2 py-1.5 flex items-start gap-1.5">
                    <span className="text-green-400 flex-shrink-0">↑</span>{h}
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
