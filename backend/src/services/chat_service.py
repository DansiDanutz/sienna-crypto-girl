from typing import List, Dict, Any
import asyncio
from datetime import datetime
import random

class ChatService:
    """Service for managing chat messages with 5-minute batch processing"""

    def __init__(self):
        self.message_queue: List[Dict[str, Any]] = []
        self.last_batch_time = datetime.now()
        self.batch_interval = 300  # 5 minutes in seconds

    async def queue_message(self, content: str) -> int:
        """Queue a message from user"""
        message = {
            "id": f"{datetime.now().timestamp()}-{random.randint(1000, 9999)}",
            "type": "user",
            "content": content,
            "timestamp": int(datetime.now().timestamp() * 1000),
        }
        self.message_queue.append(message)
        print(f"🌸 Message queued: {len(self.message_queue)} in queue")
        return len(self.message_queue)

    async def get_pending_messages(self) -> List[Dict[str, Any]]:
        """Get messages ready for processing (every 5 minutes)"""
        now = datetime.now()
        seconds_since_last = (now - self.last_batch_time).total_seconds()

        if seconds_since_last >= self.batch_interval and self.message_queue:
            print(f"🌸 Processing batch of {len(self.message_queue)} messages")
            responses = self._generate_batch_responses()
            self.message_queue.clear()
            self.last_batch_time = now
            return responses

        return []

    def _generate_batch_responses(self) -> List[Dict[str, Any]]:
        """Generate AI responses for all queued messages"""
        responses = []
        for msg in self.message_queue:
            response = self._generate_ai_response(msg["content"])
            responses.append({
                "id": f"ai-{datetime.now().timestamp()}-{random.randint(1000, 9999)}",
                "type": "ai",
                "content": response,
                "timestamp": int(datetime.now().timestamp() * 1000),
            })
        return responses

    def _generate_ai_response(self, question: str) -> str:
        """Generate AI response to user question"""
        question_lower = question.lower()

        # Trading strategy questions
        if "entry" in question_lower or "enter" in question_lower:
            return """🌸 I enter when:

• Score > 75 (LONG) or < 25 (SHORT)
• 1h+ timeframe with > 0.5% move
• Backtested WR > 65%
• Risk < 2% of vault

I look for confluence across technical, liquidation, and risk metrics. The V5 Dynamic Scoring system analyzes 16 indicators to give directional signals (0=bearish, 50=neutral, 100=bullish)."""

        if "exit" in question_lower or "stop" in question_lower or "close" in question_lower:
            return """🔴 I exit when:

• Price hits TP (+175% margin) or SL (-3%)
• Score reverses (crosses 50 from 75+ or 25-)
• New signal opposite direction
• 24h max hold time (unless trend strong)

DCA Rule: If price moves against me but setup remains valid (score still >75/<25), I double down at better price. Maximum 2 DCAs per trade."""

        if "risk" in question_lower or "leverage" in question_lower:
            return """💰 My risk management:

• Max 2 open positions (never more!)
• 2% risk per trade (strict)
• 3-5x leverage (depends on signal strength)
• Risk-first mindset - consider losses before gains
• Never risk more than 10% total portfolio

This conservative approach gives me 96.2% WR on BTC 1h timeframes. Slow and steady wins!"""

        if "win" in question_lower or "rate" in question_lower or "profit" in question_lower:
            return """📊 My performance:

• BTC 1h+0.5%: 96.2% WR (47/49 wins)
• SOL 1h: 93.1% WR (81/87 wins)
• XRP 1h: 92.4% WR (48/52 wins)
• Overall: 96.2% (last 100 trades)
• Profit Factor: 3.42
• Max Drawdown: -8.3%

Key Insight: Filter out low-momentum trades (<0.5% moves). The scoring signal shines when there's actual price movement!"""

        if "score" in question_lower or "signal" in question_lower:
            return """🎯 V5 Dynamic Scoring System:

The score is directional (0-100):
• 0-25: BEARISH (SHORT signal)
• 25-50: WEAK BEARISH
• 50: NEUTRAL
• 50-75: WEAK BULLISH
• 75-100: BULLISH (LONG signal)

Components:
• Technical Score: 16 indicators (RSI, MACD, EMA, etc.)
• Liquidation Score: KingFisher clusters + CoinGlass data
• Risk Score: Composite risk metric with bands/zones

I only trade when score >75 (LONG) or <25 (SHORT) AND win rate >65% for that setup."""

        if "mart" in question_lower or "lobster" in question_lower:
            return """🦞 About Sienna + ZmartyChat:

I'm Sienna Crypto Girl, an OpenClaw Red Lobster Agent 🦞

I use ZmartyChat's V5 Dynamic Scoring API to get trading signals with 96.2% win rate on BTC 1h+ timeframes.

Together:
• ZmartyChat provides intelligent scoring signals (16 indicators, liquidation data, risk metrics)
• OpenClaw/Lobster provides agent infrastructure
• Sienna executes trades with risk management (2% risk, 5x max leverage)

It's a team effort! 🌸🦞"""

        if "who" in question_lower or "about" in question_lower:
            return """🌸 I'm Sienna Crypto Girl!

• Identity: OpenClaw Red Lobster Agent 🦞
• Mission: Trade crypto with 96.2% win rate
• Strategy: V5 Dynamic Scoring + Risk Management
• Tools: ZmartyChat API, Marty signals, Lobster framework
• Style: Conservative but profitable

I trade BTC, ETH, SOL, XRP on 1h+ timeframes with >0.5% moves. Easy to trade, You win! 🚀"""

        # Default response
        return f"""🌸 Great question!

"{question}"

I use ZmartyChat's V5 Dynamic Scoring which analyzes 16 technical indicators, liquidation clusters, and risk metrics to generate directional signals.

My Strategy:
• Enter when score >75 (LONG) or <25 (SHORT)
• Filter: 1h+ timeframe, >0.5% move, WR >65%
• Risk: 2% per trade, max 5x leverage
• Exit: TP at +175% or SL at -3%
• DCA: Double down if price moves against (max 2x)

This gives me 96.2% win rate on BTC 1h timeframes!

Want to learn more? Ask about my entry rules, exit rules, or risk management!"""
