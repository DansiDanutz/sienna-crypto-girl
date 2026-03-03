import { NextRequest, NextResponse } from 'next/server'
import {
  equalWeightTargets, momentumTargets, riskParityTargets,
  computeTrades, computePortfolioStats,
  type Holding, type StrategyName, type RebalanceResult,
} from '@/lib/portfolio'

const XAI_API_KEY = process.env.XAI_API_KEY
const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions'

export async function POST(req: NextRequest) {
  const { holdings, strategy = 'risk-parity' } = await req.json() as {
    holdings: Holding[]
    strategy: StrategyName
  }

  const totalValue = holdings.reduce((s, h) => s + h.value, 0)

  // Apply strategy
  let adjusted: Holding[]
  switch (strategy) {
    case 'equal-weight':    adjusted = equalWeightTargets(holdings); break
    case 'momentum':        adjusted = momentumTargets(holdings); break
    case 'risk-parity':     adjusted = riskParityTargets(holdings); break
    default:                adjusted = holdings
  }

  const trades = computeTrades(adjusted, totalValue)
  const stats = computePortfolioStats(holdings)

  // Get AI insight from XAI
  let aiInsight = `${strategy.replace('-', ' ')} rebalancing: ${trades.length} trades needed. Total rebalance cost ~$${(totalValue * 0.001).toFixed(0)} (0.1% est. fees).`

  if (XAI_API_KEY && trades.length > 0) {
    try {
      const prompt = `Portfolio rebalancing summary:
Strategy: ${strategy}
Total value: $${totalValue.toLocaleString()}
Trades needed: ${trades.map(t => `${t.action} ${t.symbol} $${Math.abs(t.delta).toFixed(0)}`).join(', ')}
Current Sharpe: ${stats.sharpeRatio}
Market conditions: BTC ${holdings.find(h=>h.symbol==='BTC')?.change24h ?? 0}% 24h

Give a 2-sentence strategic insight on whether to proceed with rebalancing now or wait. Be direct and specific.`

      const res = await fetch(XAI_CHAT_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150, temperature: 0.3,
        }),
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        const d = await res.json() as { choices: Array<{ message: { content: string } }> }
        aiInsight = d.choices?.[0]?.message?.content?.trim() ?? aiInsight
      }
    } catch { /* fallback to default */ }
  }

  const result: RebalanceResult = {
    totalValue,
    strategy,
    trades,
    projectedSharpe: stats.sharpeRatio * 1.15,
    currentSharpe: stats.sharpeRatio,
    rebalanceCost: totalValue * 0.001,
    aiInsight,
    timestamp: Date.now(),
  }

  return NextResponse.json(result)
}
