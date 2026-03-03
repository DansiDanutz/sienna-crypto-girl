import { NextRequest, NextResponse } from 'next/server'
import { scoreToLabel, demoSentimentReport, type SentimentReport } from '@/lib/sentiment'

const XAI_API_KEY = process.env.XAI_API_KEY

export async function POST(req: NextRequest) {
  const { symbol, headlines = [] } = await req.json() as { symbol: string; headlines?: string[] }

  if (!XAI_API_KEY || headlines.length === 0) {
    return NextResponse.json(demoSentimentReport(symbol))
  }

  try {
    const prompt = `Analyze the sentiment of these ${symbol} news headlines and return a JSON object with these fields: overallScore (number -1 to 1), confidence (0-100), bullishCount, bearishCount, neutralCount, trend (improving/deteriorating/stable), aiSummary (2 sentences max).

Headlines:
${headlines.slice(0, 20).map((h, i) => `${i+1}. ${h}`).join('\n')}

Return ONLY valid JSON, no markdown.`

    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300, temperature: 0.2,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (res.ok) {
      const d = await res.json() as { choices: Array<{ message: { content: string } }> }
      const raw = d.choices?.[0]?.message?.content?.trim() ?? '{}'
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

      const report: SentimentReport = {
        symbol,
        overallScore: parsed.overallScore ?? 0,
        overallLabel: scoreToLabel(parsed.overallScore ?? 0),
        confidence: parsed.confidence ?? 70,
        newsCount: headlines.length,
        bullishCount: parsed.bullishCount ?? 0,
        bearishCount: parsed.bearishCount ?? 0,
        neutralCount: parsed.neutralCount ?? headlines.length,
        fearGreedIndex: 50 + Math.round((parsed.overallScore ?? 0) * 30),
        socialVolume: 1.0,
        influencerSentiment: parsed.overallScore ?? 0,
        trend: parsed.trend ?? 'stable',
        topBullishHeadlines: headlines.filter((_, i) => i < 2),
        topBearishHeadlines: [],
        aiSummary: parsed.aiSummary ?? '',
        timestamp: Date.now(),
      }
      return NextResponse.json(report)
    }
  } catch { /* fall through to demo */ }

  return NextResponse.json(demoSentimentReport(symbol))
}
