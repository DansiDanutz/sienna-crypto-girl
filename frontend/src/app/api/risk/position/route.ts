import { NextRequest, NextResponse } from 'next/server'
import { atrPositionSize, generateRiskAlerts, DEFAULT_RISK_PROFILE } from '@/lib/risk'

export async function POST(req: NextRequest) {
  const { accountBalance, entryPrice, atr, symbol, openPositions = 0, drawdown = 0, volatility = 2, correlationRisk = 0.5 } =
    await req.json() as {
      accountBalance: number
      entryPrice: number
      atr: number
      symbol: string
      openPositions?: number
      drawdown?: number
      volatility?: number
      correlationRisk?: number
    }

  const position = atrPositionSize(accountBalance, DEFAULT_RISK_PROFILE.maxPositionSize, entryPrice, atr)
  position.symbol = symbol

  const alerts = generateRiskAlerts(openPositions, drawdown, volatility, correlationRisk, DEFAULT_RISK_PROFILE)

  return NextResponse.json({ position, alerts, profile: DEFAULT_RISK_PROFILE })
}
