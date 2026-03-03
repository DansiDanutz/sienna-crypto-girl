import { NextRequest, NextResponse } from 'next/server'
import { detectPatterns, demoPatternsForPrice, type OHLCV } from '@/lib/patterns'

export async function POST(req: NextRequest) {
  const { candles, symbol, currentPrice } = await req.json() as {
    candles?: OHLCV[]
    symbol: string
    currentPrice: number
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
