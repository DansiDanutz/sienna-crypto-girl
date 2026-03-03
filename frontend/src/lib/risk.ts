// Dynamic Risk Management — position sizing, stop-loss, risk limits

export interface RiskProfile {
  maxPositionSize: number     // % of portfolio per trade
  maxDailyLoss: number        // % portfolio max daily drawdown
  maxOpenPositions: number
  stopLossMultiplier: number  // ATR multiplier for stops
  takeProfitMultiplier: number
  riskRewardMin: number       // minimum R:R ratio
  leverageMax: number
  volatilityThreshold: number // % — pause trading if above
}

export interface PositionSize {
  symbol: string
  accountBalance: number
  entryPrice: number
  stopLossPrice: number
  riskPercent: number         // % of account to risk
  positionSizeUnits: number
  positionSizeUSD: number
  potentialLossUSD: number
  potentialGainUSD: number
  riskRewardRatio: number
  leverageUsed: number
  marginRequired: number
  recommendation: 'ENTER' | 'REDUCE' | 'SKIP'
  reasons: string[]
}

export interface RiskAlert {
  id: string
  level: 'info' | 'warning' | 'critical'
  type: 'drawdown' | 'concentration' | 'volatility' | 'correlation' | 'leverage'
  message: string
  action: string
  timestamp: number
}

export interface DailyRiskMetrics {
  date: string
  totalExposure: number       // USD open positions
  maxDrawdown: number         // % from daily peak
  realizedPnL: number
  unrealizedPnL: number
  openPositions: number
  riskUtilization: number     // % of daily risk budget used
  largestPosition: string
  correlationRisk: number     // 0–1 (high = all positions correlated)
}

export const DEFAULT_RISK_PROFILE: RiskProfile = {
  maxPositionSize: 5,
  maxDailyLoss: 3,
  maxOpenPositions: 8,
  stopLossMultiplier: 2.0,
  takeProfitMultiplier: 3.0,
  riskRewardMin: 1.5,
  leverageMax: 3,
  volatilityThreshold: 5,
}

// Kelly Criterion (fractional)
export function kellyPositionSize(
  winRate: number,        // 0–1
  avgWin: number,         // avg win $ or %
  avgLoss: number,        // avg loss $ or %
  fraction = 0.25         // fractional Kelly (25% = conservative)
): number {
  const b = avgWin / Math.abs(avgLoss)
  const kelly = (b * winRate - (1 - winRate)) / b
  return Math.max(0, kelly * fraction)
}

// ATR-based position sizing
export function atrPositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  atr: number,
  atrMultiplier = 2.0
): PositionSize {
  const stopLossDistance = atr * atrMultiplier
  const stopLossPrice = entryPrice - stopLossDistance
  const riskPerUnit = entryPrice - stopLossPrice
  const riskUSD = accountBalance * (riskPercent / 100)
  const units = riskPerUnit > 0 ? riskUSD / riskPerUnit : 0
  const positionUSD = units * entryPrice
  const tpPrice = entryPrice + stopLossDistance * 2
  const potentialGain = (tpPrice - entryPrice) * units

  const rrRatio = riskPerUnit > 0 ? (tpPrice - entryPrice) / riskPerUnit : 0

  const reasons: string[] = []
  let recommendation: PositionSize['recommendation'] = 'ENTER'

  if (rrRatio < 1.5) { reasons.push(`R:R ${rrRatio.toFixed(1)} < 1.5 minimum`); recommendation = 'SKIP' }
  if (positionUSD / accountBalance > 0.1) { reasons.push('Position >10% of portfolio'); recommendation = 'REDUCE' }
  if (reasons.length === 0) reasons.push('All risk checks passed ✓')

  return {
    symbol: '',
    accountBalance,
    entryPrice,
    stopLossPrice,
    riskPercent,
    positionSizeUnits: parseFloat(units.toFixed(6)),
    positionSizeUSD: parseFloat(positionUSD.toFixed(2)),
    potentialLossUSD: parseFloat(riskUSD.toFixed(2)),
    potentialGainUSD: parseFloat(potentialGain.toFixed(2)),
    riskRewardRatio: parseFloat(rrRatio.toFixed(2)),
    leverageUsed: 1,
    marginRequired: positionUSD,
    recommendation,
    reasons,
  }
}

// Generate risk alerts based on current portfolio state
export function generateRiskAlerts(
  openPositions: number,
  drawdownPercent: number,
  volatility: number,
  correlationRisk: number,
  profile: RiskProfile
): RiskAlert[] {
  const alerts: RiskAlert[] = []
  const now = Date.now()

  if (drawdownPercent > profile.maxDailyLoss) {
    alerts.push({
      id: `dd_${now}`, level: 'critical', type: 'drawdown',
      message: `Daily drawdown ${drawdownPercent.toFixed(1)}% exceeds limit of ${profile.maxDailyLoss}%`,
      action: 'Close all positions immediately', timestamp: now,
    })
  } else if (drawdownPercent > profile.maxDailyLoss * 0.7) {
    alerts.push({
      id: `dd_warn_${now}`, level: 'warning', type: 'drawdown',
      message: `Drawdown at ${drawdownPercent.toFixed(1)}% — approaching daily limit`,
      action: 'Reduce position sizes', timestamp: now,
    })
  }

  if (volatility > profile.volatilityThreshold) {
    alerts.push({
      id: `vol_${now}`, level: 'warning', type: 'volatility',
      message: `Market volatility ${volatility.toFixed(1)}% exceeds threshold ${profile.volatilityThreshold}%`,
      action: 'Pause new entries, tighten stops', timestamp: now,
    })
  }

  if (correlationRisk > 0.8) {
    alerts.push({
      id: `corr_${now}`, level: 'warning', type: 'correlation',
      message: `High portfolio correlation (${(correlationRisk * 100).toFixed(0)}%) — limited diversification`,
      action: 'Add uncorrelated assets or reduce exposure', timestamp: now,
    })
  }

  if (openPositions > profile.maxOpenPositions) {
    alerts.push({
      id: `pos_${now}`, level: 'info', type: 'concentration',
      message: `${openPositions} open positions exceeds limit of ${profile.maxOpenPositions}`,
      action: 'Close weakest positions before new entries', timestamp: now,
    })
  }

  return alerts
}
