import { NextRequest, NextResponse } from 'next/server'
import {
  equalWeightTargets, momentumTargets, riskParityTargets,
  computeTrades, computePortfolioStats,
  type Holding, type StrategyName, type RebalanceResult,
} from '@/lib/portfolio'
import { MemberAuthError, requireAuthenticatedMember } from '@/lib/member-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { ApiInputError, isFiniteNumber, isSafeSymbol, readBoundedJson } from '@/lib/api-input'

const XAI_API_KEY = process.env.XAI_API_KEY
const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    await requireAuthenticatedMember(req)
  } catch (error) {
    if (error instanceof MemberAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 })
  }

  const rateLimit = checkRateLimit(req, 'portfolio-rebalance', 10, 60_000)
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  let body
  try {
    body = await readBoundedJson(req)
  } catch (error) {
    const status = error instanceof ApiInputError ? error.status : 400
    return NextResponse.json({ error: 'Invalid request body.' }, { status })
  }
  const holdings = body?.holdings
  const strategy = body?.strategy ?? 'risk-parity'
  const strategies: StrategyName[] = ['equal-weight', 'momentum', 'risk-parity']
  const validHoldings = Array.isArray(holdings)
    && holdings.length > 0
    && holdings.length <= 100
    && holdings.every((holding: Holding) =>
      isSafeSymbol(holding?.symbol)
      && isFiniteNumber(holding?.value)
      && isFiniteNumber(holding?.amount)
      && isFiniteNumber(holding?.currentPrice)
      && isFiniteNumber(holding?.targetWeight)
      && isFiniteNumber(holding?.currentWeight)
      && isFiniteNumber(holding?.change24h, -100)
      && isFiniteNumber(holding?.volatility7d)
      && isFiniteNumber(holding?.beta, Number.NEGATIVE_INFINITY),
    )
  if (!validHoldings || !strategies.includes(strategy)) {
    return NextResponse.json({ error: 'Invalid holdings or strategy.' }, { status: 400 })
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
