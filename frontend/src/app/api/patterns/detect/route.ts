import { NextRequest, NextResponse } from 'next/server'
import { detectPatterns, demoPatternsForPrice, type OHLCV } from '@/lib/patterns'
import { ApiInputError, isFiniteNumber, isSafeSymbol, isValidCandle, readBoundedJson } from '@/lib/api-input'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(req, 'patterns-detect', 30, 60_000)
  if (!rateLimit.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

  let body
  try {
    body = await readBoundedJson(req)
  } catch (error) {
    const status = error instanceof ApiInputError ? error.status : 400
    return NextResponse.json({ error: 'Invalid request body.' }, { status })
  }
  const { candles, symbol, currentPrice } = body as {
    candles?: OHLCV[]
    symbol: string
    currentPrice: number
  }

  if (!isSafeSymbol(symbol) || !isFiniteNumber(currentPrice, Number.EPSILON)) {
    return NextResponse.json({ error: 'Invalid symbol or price.' }, { status: 400 })
  }
  if (candles !== undefined && (!Array.isArray(candles) || candles.length > 5_000 || !candles.every(isValidCandle))) {
    return NextResponse.json({ error: 'Invalid candles.' }, { status: 400 })
  }

  if (!candles || candles.length < 20) {
    return NextResponse.json({
      symbol,
      patterns: demoPatternsForPrice(currentPrice),
      candleCount: 0,
      timestamp: Date.now(),
    })
  }

  const patterns = detectPatterns(candles, currentPrice)

  return NextResponse.json({
    symbol,
    patterns,
    candleCount: candles.length,
    timestamp: Date.now(),
  })
}
