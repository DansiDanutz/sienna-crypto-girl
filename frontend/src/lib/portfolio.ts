// Portfolio Rebalancing AI — types, algorithms, math

export interface Holding {
  symbol: string
  amount: number          // units held
  currentPrice: number    // USD
  value: number           // amount * currentPrice
  targetWeight: number    // 0–1 desired allocation
  currentWeight: number   // 0–1 actual allocation
  change24h: number       // % price change last 24h
  volatility7d: number    // 7-day rolling std dev %
  beta: number            // vs BTC
}

export interface RebalanceTrade {
  symbol: string
  action: 'BUY' | 'SELL'
  currentValue: number
  targetValue: number
  delta: number           // USD to buy (+) or sell (-)
  deltaPercent: number    // % of portfolio
  urgency: 'low' | 'medium' | 'high'
  reason: string
}

export interface RebalanceResult {
  totalValue: number
  strategy: StrategyName
  trades: RebalanceTrade[]
  projectedSharpe: number
  currentSharpe: number
  rebalanceCost: number   // estimated gas/fees USD
  aiInsight: string
  timestamp: number
}

export type StrategyName =
  | 'equal-weight'
  | 'momentum'
  | 'risk-parity'
  | 'mean-variance'
  | 'custom'

export interface PortfolioStats {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  beta: number
  correlation: number     // to BTC
  diversificationScore: number  // 0–100
}

// ── Rebalancing Strategies ───────────────────────────────────────────────────

export function equalWeightTargets(holdings: Holding[]): Holding[] {
  const weight = 1 / holdings.length
  return holdings.map(h => ({ ...h, targetWeight: weight }))
}

export function momentumTargets(holdings: Holding[], lookback = 7): Holding[] {
  // Weight by positive momentum, zero-weight negative
  const scores = holdings.map(h => Math.max(0, h.change24h))
  const total = scores.reduce((s, x) => s + x, 0) || 1
  return holdings.map((h, i) => ({
    ...h,
    targetWeight: total > 0 ? scores[i] / total : 1 / holdings.length,
  }))
}

export function riskParityTargets(holdings: Holding[]): Holding[] {
  // Weight inversely proportional to volatility
  const invVols = holdings.map(h => 1 / Math.max(0.01, h.volatility7d))
  const total = invVols.reduce((s, x) => s + x, 0) || 1
  return holdings.map((h, i) => ({
    ...h,
    targetWeight: invVols[i] / total,
  }))
}

export function computeTrades(
  holdings: Holding[],
  totalValue: number,
  threshold = 0.02   // only rebalance if drift > 2%
): RebalanceTrade[] {
  return holdings
    .map(h => {
      const targetValue = h.targetWeight * totalValue
      const delta = targetValue - h.value
      const deltaPercent = Math.abs(delta) / totalValue

      if (deltaPercent < threshold) return null

      const urgency: RebalanceTrade['urgency'] =
        deltaPercent > 0.1 ? 'high' : deltaPercent > 0.05 ? 'medium' : 'low'

      return {
        symbol: h.symbol,
        action: delta > 0 ? 'BUY' : 'SELL',
        currentValue: h.value,
        targetValue,
        delta,
        deltaPercent: deltaPercent * 100,
        urgency,
        reason: urgency === 'high'
          ? `Drifted ${(deltaPercent * 100).toFixed(1)}% from target — immediate action`
          : `Allocation off by ${(deltaPercent * 100).toFixed(1)}%`,
      } as RebalanceTrade
    })
    .filter(Boolean) as RebalanceTrade[]
}

export function computePortfolioStats(holdings: Holding[]): PortfolioStats {
  const totalValue = holdings.reduce((s, h) => s + h.value, 0)
  const weights = holdings.map(h => h.value / (totalValue || 1))

  // Weighted beta vs BTC
  const beta = weights.reduce((s, w, i) => s + w * holdings[i].beta, 0)

  // Herfindahl–Hirschman concentration (lower = more diverse)
  const hhi = weights.reduce((s, w) => s + w * w, 0)
  const diversificationScore = Math.round((1 - hhi) * 100)

  // Simplified Sharpe: avg return / std dev (using change24h as proxy)
  const returns = holdings.map(h => h.change24h / 100)
  const avgReturn = weights.reduce((s, w, i) => s + w * returns[i], 0)
  const variance = weights.reduce((s, w, i) => s + w * Math.pow(returns[i] - avgReturn, 2), 0)
  const sharpeRatio = variance > 0 ? parseFloat((avgReturn / Math.sqrt(variance)).toFixed(2)) : 0

  return {
    totalValue,
    totalPnL: 0,
    totalPnLPercent: 0,
    sharpeRatio,
    sortinoRatio: sharpeRatio * 1.1,
    maxDrawdown: -12.4,   // placeholder, would need history
    beta,
    correlation: 0.78,
    diversificationScore,
  }
}

// ── Default demo portfolio ────────────────────────────────────────────────────

export const DEMO_HOLDINGS: Holding[] = [
  { symbol: 'BTC',  amount: 0.5,   currentPrice: 67000, value: 33500, targetWeight: 0.40, currentWeight: 0.335, change24h: 2.3,  volatility7d: 3.2, beta: 1.0  },
  { symbol: 'ETH',  amount: 5,     currentPrice: 3400,  value: 17000, targetWeight: 0.25, currentWeight: 0.170, change24h: 3.1,  volatility7d: 4.1, beta: 1.2  },
  { symbol: 'SOL',  amount: 50,    currentPrice: 145,   value: 7250,  targetWeight: 0.15, currentWeight: 0.073, change24h: -1.2, volatility7d: 6.8, beta: 1.5  },
  { symbol: 'BNB',  amount: 15,    currentPrice: 420,   value: 6300,  targetWeight: 0.10, currentWeight: 0.063, change24h: 0.8,  volatility7d: 3.5, beta: 0.9  },
  { symbol: 'AVAX', amount: 100,   currentPrice: 38,    value: 3800,  targetWeight: 0.05, currentWeight: 0.038, change24h: 4.2,  volatility7d: 7.2, beta: 1.4  },
  { symbol: 'USDC', amount: 32100, currentPrice: 1,     value: 32100, targetWeight: 0.05, currentWeight: 0.322, change24h: 0,    volatility7d: 0.1, beta: 0.0  },
]
