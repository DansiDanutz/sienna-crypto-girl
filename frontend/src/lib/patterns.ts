// Pattern Recognition ML — chart pattern detection

export type PatternName =
  | 'head-and-shoulders'
  | 'inverse-head-and-shoulders'
  | 'double-top'
  | 'double-bottom'
  | 'ascending-triangle'
  | 'descending-triangle'
  | 'symmetrical-triangle'
  | 'bull-flag'
  | 'bear-flag'
  | 'cup-and-handle'
  | 'wedge-rising'
  | 'wedge-falling'

export interface DetectedPattern {
  name: PatternName
  label: string
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number          // 0–100
  priceTarget: number         // predicted target price
  stopLoss: number
  breakoutLevel: number
  formationStart: number      // timestamp
  formationEnd: number        // timestamp
  description: string
  winRateHistorical: number   // % win rate for this pattern
}

export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const PATTERN_METADATA: Record<PatternName, {
  label: string; direction: 'bullish' | 'bearish' | 'neutral'; winRate: number; description: string
}> = {
  'head-and-shoulders':         { label: 'Head & Shoulders',          direction: 'bearish',  winRate: 83, description: 'Classic reversal — three peaks with middle highest. Neckline break confirms.' },
  'inverse-head-and-shoulders': { label: 'Inv. Head & Shoulders',     direction: 'bullish',  winRate: 81, description: 'Bottom reversal — three troughs, middle deepest. Strong buy on neckline break.' },
  'double-top':                 { label: 'Double Top',                 direction: 'bearish',  winRate: 75, description: 'Two equal highs = resistance. Break below neckline signals reversal.' },
  'double-bottom':              { label: 'Double Bottom',             direction: 'bullish',  winRate: 76, description: 'Two equal lows = support floor. Break above neckline is buy signal.' },
  'ascending-triangle':         { label: 'Ascending Triangle',        direction: 'bullish',  winRate: 72, description: 'Flat resistance + rising support. Bullish breakout when resistance breaks.' },
  'descending-triangle':        { label: 'Descending Triangle',       direction: 'bearish',  winRate: 71, description: 'Flat support + falling resistance. Bearish continuation pattern.' },
  'symmetrical-triangle':       { label: 'Symmetrical Triangle',      direction: 'neutral',  winRate: 54, description: 'Converging trendlines. Direction of breakout determines trade.' },
  'bull-flag':                  { label: 'Bull Flag',                 direction: 'bullish',  winRate: 67, description: 'Strong pole + tight consolidation. Buy breakout of upper flag line.' },
  'bear-flag':                  { label: 'Bear Flag',                 direction: 'bearish',  winRate: 65, description: 'Sharp drop + brief rally. Short on break below flag support.' },
  'cup-and-handle':             { label: 'Cup & Handle',              direction: 'bullish',  winRate: 68, description: 'Rounded bottom + pullback. Strong uptrend continuation on breakout.' },
  'wedge-rising':               { label: 'Rising Wedge',              direction: 'bearish',  winRate: 63, description: 'Converging upward trendlines. Usually breaks down despite upward movement.' },
  'wedge-falling':              { label: 'Falling Wedge',             direction: 'bullish',  winRate: 64, description: 'Converging downward trendlines. Usually breaks up — buy the break.' },
}

// Simplified pattern detection on OHLCV data
export function detectPatterns(candles: OHLCV[], currentPrice: number): DetectedPattern[] {
  if (candles.length < 20) return []
  const detected: DetectedPattern[] = []
  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const closes = candles.map(c => c.close)
  const n = candles.length

  // Find local maxima and minima (simplified)
  const localMaxima: number[] = []
  const localMinima: number[] = []
  for (let i = 2; i < n - 2; i++) {
    if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
      localMaxima.push(i)
    }
    if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
      localMinima.push(i)
    }
  }

  // Double Top detection
  if (localMaxima.length >= 2) {
    const last2Max = localMaxima.slice(-2)
    const h1 = highs[last2Max[0]], h2 = highs[last2Max[1]]
    const similarity = 1 - Math.abs(h1 - h2) / ((h1 + h2) / 2)
    if (similarity > 0.97) {
      const neckline = Math.min(...lows.slice(last2Max[0], last2Max[1]))
      const target = neckline - (h1 - neckline)
      detected.push({
        name: 'double-top',
        ...PATTERN_METADATA['double-top'],
        confidence: Math.round(similarity * 90),
        priceTarget: target,
        stopLoss: h1 * 1.01,
        breakoutLevel: neckline,
        formationStart: candles[last2Max[0]].time,
        formationEnd: candles[last2Max[1]].time,
      })
    }
  }

  // Double Bottom detection
  if (localMinima.length >= 2) {
    const last2Min = localMinima.slice(-2)
    const l1 = lows[last2Min[0]], l2 = lows[last2Min[1]]
    const similarity = 1 - Math.abs(l1 - l2) / ((l1 + l2) / 2)
    if (similarity > 0.97) {
      const neckline = Math.max(...highs.slice(last2Min[0], last2Min[1]))
      const target = neckline + (neckline - l1)
      detected.push({
        name: 'double-bottom',
        ...PATTERN_METADATA['double-bottom'],
        confidence: Math.round(similarity * 88),
        priceTarget: target,
        stopLoss: l1 * 0.99,
        breakoutLevel: neckline,
        formationStart: candles[last2Min[0]].time,
        formationEnd: candles[last2Min[1]].time,
      })
    }
  }

  // Bull Flag — recent sharp rise + consolidation
  const recentCandles = candles.slice(-15)
  const poleCandles = candles.slice(-25, -15)
  if (poleCandles.length === 10) {
    const poleRise = (poleCandles[9].close - poleCandles[0].close) / poleCandles[0].close
    const flagRange = Math.max(...recentCandles.map(c => c.high)) - Math.min(...recentCandles.map(c => c.low))
    const flagRangePercent = flagRange / poleCandles[9].close
    if (poleRise > 0.05 && flagRangePercent < 0.03) {
      const flagHigh = Math.max(...recentCandles.map(c => c.high))
      detected.push({
        name: 'bull-flag',
        ...PATTERN_METADATA['bull-flag'],
        confidence: Math.round(70 + poleRise * 200),
        priceTarget: flagHigh + flagHigh * poleRise,
        stopLoss: Math.min(...recentCandles.map(c => c.low)) * 0.99,
        breakoutLevel: flagHigh,
        formationStart: poleCandles[0].time,
        formationEnd: recentCandles[recentCandles.length - 1].time,
      })
    }
  }

  // Head & Shoulders — simplified 3-peak check
  if (localMaxima.length >= 3) {
    const last3 = localMaxima.slice(-3)
    const [l, m, r] = last3.map(i => highs[i])
    if (m > l && m > r && Math.abs(l - r) / l < 0.05) {
      const neckline = Math.min(lows[last3[0]], lows[last3[2]])
      detected.push({
        name: 'head-and-shoulders',
        ...PATTERN_METADATA['head-and-shoulders'],
        confidence: Math.round(75 + (1 - Math.abs(l-r)/l) * 15),
        priceTarget: neckline - (m - neckline),
        stopLoss: m * 1.01,
        breakoutLevel: neckline,
        formationStart: candles[last3[0]].time,
        formationEnd: candles[last3[2]].time,
      })
    }
  }

  return detected.sort((a, b) => b.confidence - a.confidence)
}

// Generate demo pattern data for UI
export function demoPatternsForPrice(basePrice: number): DetectedPattern[] {
  const now = Date.now()
  return [
    {
      name: 'bull-flag', ...PATTERN_METADATA['bull-flag'],
      confidence: 82,
      priceTarget: basePrice * 1.08,
      stopLoss: basePrice * 0.97,
      breakoutLevel: basePrice * 1.01,
      formationStart: now - 86400000 * 3,
      formationEnd: now,
    },
    {
      name: 'ascending-triangle', ...PATTERN_METADATA['ascending-triangle'],
      confidence: 74,
      priceTarget: basePrice * 1.12,
      stopLoss: basePrice * 0.95,
      breakoutLevel: basePrice * 1.02,
      formationStart: now - 86400000 * 7,
      formationEnd: now,
    },
  ]
}
