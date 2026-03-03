// NLP Sentiment Engine — news + social sentiment analysis

export type SentimentScore = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish'

export interface NewsItem {
  id: string
  headline: string
  source: string
  url: string
  publishedAt: number
  symbol?: string
  sentiment: SentimentScore
  sentimentScore: number      // -1.0 to +1.0
  relevance: number           // 0–1
  impact: 'low' | 'medium' | 'high'
  keywords: string[]
  summary?: string
}

export interface SentimentReport {
  symbol: string
  overallScore: number        // -1.0 to +1.0
  overallLabel: SentimentScore
  confidence: number          // 0–100
  newsCount: number
  bullishCount: number
  bearishCount: number
  neutralCount: number
  fearGreedIndex: number      // 0–100 (0=extreme fear, 100=extreme greed)
  socialVolume: number        // relative volume vs 7d avg
  influencerSentiment: number // -1 to +1 from key influencers
  trend: 'improving' | 'deteriorating' | 'stable'
  topBullishHeadlines: string[]
  topBearishHeadlines: string[]
  aiSummary: string
  timestamp: number
}

export interface MarketSentimentOverview {
  fearGreedIndex: number
  fearGreedLabel: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  dominance: { symbol: string; percent: number }[]
  trending: string[]
  globalSentiment: SentimentScore
  volumeAlert: boolean
  newsVelocity: number        // news items per hour
}

export const SENTIMENT_COLORS: Record<SentimentScore, string> = {
  very_bearish: '#EF4444',
  bearish: '#F97316',
  neutral: '#6B7280',
  bullish: '#22C55E',
  very_bullish: '#10B981',
}

export const SENTIMENT_LABELS: Record<SentimentScore, string> = {
  very_bearish: '🔴 Very Bearish',
  bearish: '🟠 Bearish',
  neutral: '⚪ Neutral',
  bullish: '🟢 Bullish',
  very_bullish: '🟩 Very Bullish',
}

export function scoreToLabel(score: number): SentimentScore {
  if (score < -0.6) return 'very_bearish'
  if (score < -0.2) return 'bearish'
  if (score < 0.2) return 'neutral'
  if (score < 0.6) return 'bullish'
  return 'very_bullish'
}

export function fearGreedLabel(index: number): MarketSentimentOverview['fearGreedLabel'] {
  if (index < 20) return 'Extreme Fear'
  if (index < 40) return 'Fear'
  if (index < 60) return 'Neutral'
  if (index < 80) return 'Greed'
  return 'Extreme Greed'
}

export function fearGreedColor(index: number): string {
  if (index < 20) return '#EF4444'
  if (index < 40) return '#F97316'
  if (index < 60) return '#EAB308'
  if (index < 80) return '#22C55E'
  return '#10B981'
}

// Demo data
export function demoSentimentReport(symbol: string): SentimentReport {
  const score = symbol === 'BTC' ? 0.42 : symbol === 'ETH' ? 0.31 : 0.15
  return {
    symbol,
    overallScore: score,
    overallLabel: scoreToLabel(score),
    confidence: 78,
    newsCount: 47,
    bullishCount: 28,
    bearishCount: 12,
    neutralCount: 7,
    fearGreedIndex: 62,
    socialVolume: 1.34,
    influencerSentiment: 0.51,
    trend: 'improving',
    topBullishHeadlines: [
      `${symbol} sees massive institutional inflow — BlackRock adds to position`,
      `${symbol} technical analysis: Golden cross forming on weekly chart`,
    ],
    topBearishHeadlines: [
      `SEC regulatory clarity still unclear for ${symbol}`,
    ],
    aiSummary: `${symbol} sentiment is ${scoreToLabel(score).replace('_',' ')} with ${78}% confidence. Institutional interest remains high. Short-term volatility expected around upcoming macro events.`,
    timestamp: Date.now(),
  }
}

export function demoMarketOverview(): MarketSentimentOverview {
  return {
    fearGreedIndex: 62,
    fearGreedLabel: 'Greed',
    dominance: [
      { symbol: 'BTC', percent: 52.3 },
      { symbol: 'ETH', percent: 17.1 },
      { symbol: 'Others', percent: 30.6 },
    ],
    trending: ['BTC', 'SOL', 'AVAX', 'INJ', 'TIA'],
    globalSentiment: 'bullish',
    volumeAlert: false,
    newsVelocity: 23,
  }
}
