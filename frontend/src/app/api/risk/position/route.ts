import { NextRequest, NextResponse } from 'next/server'
import { atrPositionSize, generateRiskAlerts, DEFAULT_RISK_PROFILE } from '@/lib/risk'
import { ApiInputError, isFiniteNumber, isSafeSymbol, readBoundedJson } from '@/lib/api-input'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 'risk-position', 30, 60_000)
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  let body
  try {
    body = await readBoundedJson(req)
  } catch (error) {
    const status = error instanceof ApiInputError ? error.status : 400
    return NextResponse.json({ error: 'Invalid request body.' }, { status })
  }
  const { accountBalance, entryPrice, atr, symbol, openPositions = 0, drawdown = 0, volatility = 2, correlationRisk = 0.5 } =
    body as {
      accountBalance: number
      entryPrice: number
      atr: number
      symbol: string
      openPositions?: number
      drawdown?: number
      volatility?: number
      correlationRisk?: number
    }

  if (
    !isSafeSymbol(symbol)
    || !isFiniteNumber(accountBalance)
    || !isFiniteNumber(entryPrice, Number.EPSILON)
    || !isFiniteNumber(atr, Number.EPSILON)
    || !isFiniteNumber(openPositions)
    || !isFiniteNumber(drawdown)
    || !isFiniteNumber(volatility)
    || !isFiniteNumber(correlationRisk)
  ) {
    return NextResponse.json({ error: 'Invalid risk inputs.' }, { status: 400 })
  }

  const position = atrPositionSize(accountBalance, DEFAULT_RISK_PROFILE.maxPositionSize, entryPrice, atr)
  position.symbol = symbol

  const alerts = generateRiskAlerts(openPositions, drawdown, volatility, correlationRisk, DEFAULT_RISK_PROFILE)

  return NextResponse.json({ position, alerts, profile: DEFAULT_RISK_PROFILE })
}
