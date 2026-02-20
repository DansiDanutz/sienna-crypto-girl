import httpx
from typing import List, Dict, Any, Optional
import os

class ZmartyChatService:
    """Service for fetching trading data from ZmartyChat API"""

    def __init__(self):
        self.base_url = os.getenv("ZMARTYCHAT_API_URL", "https://zmarty-chat-api.onrender.com")
        self.api_key = os.getenv("ZMARTYCHAT_API_KEY", "")

    async def get_trades(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get all paper trades from ZmartyChat"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/paper-trades",
                    params={"limit": limit},
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else None,
                )
                response.raise_for_status()
                return response.json().get("trades", [])
        except Exception as e:
            print(f"Error fetching trades: {e}")
            # Return sample data for now (in production, fix the API endpoint)
            return self._get_sample_trades(limit)

    async def get_active_trades(self) -> List[Dict[str, Any]]:
        """Get currently open positions"""
        trades = await self.get_trades(limit=100)
        return [t for t in trades if t.get("status") == "OPEN"]

    async def get_trade_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get closed trades history"""
        trades = await self.get_trades(limit=limit * 2)
        return [t for t in trades if t.get("status") == "CLOSED"][:limit]

    async def get_stats(self) -> Dict[str, Any]:
        """Get trading statistics"""
        trades = await self.get_trades(limit=100)
        closed = [t for t in trades if t.get("status") == "CLOSED"]

        total_trades = len(closed)
        wins = [t for t in closed if t.get("profit", 0) > 0]
        losses = [t for t in closed if t.get("profit", 0) <= 0]

        win_rate = (len(wins) / total_trades * 100) if total_trades > 0 else 0

        gross_profit = sum(t.get("profit", 0) for t in wins)
        gross_loss = abs(sum(t.get("profit", 0) for t in losses))

        profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0

        # Calculate max drawdown
        cumulative = []
        running = 0
        for t in closed:
            running += t.get("profit", 0)
            cumulative.append(running)

        peak = max(cumulative) if cumulative else 0
        trough = min(cumulative) if cumulative else 0
        max_drawdown = ((trough - peak) / peak * 100) if peak > 0 else 0

        total_profit = cumulative[-1] if cumulative else 0

        current_positions = len([t for t in trades if t.get("status") == "OPEN"])

        return {
            "winRate": round(win_rate, 1),
            "totalTrades": total_trades,
            "profitFactor": round(profit_factor, 2),
            "maxDrawdown": round(max_drawdown, 1),
            "totalProfit": round(total_profit, 1),
            "currentPositions": current_positions,
        }

    async def get_smart_signals(self) -> List[Dict[str, Any]]:
        """Get smart signals from ZmartyChat (WR > 65%)"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/signals/smart",
                    headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else None,
                )
                response.raise_for_status()
                return response.json().get("signals", [])
        except Exception as e:
            print(f"Error fetching signals: {e}")
            return []

    def _get_sample_trades(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Return sample trades for testing"""
        return [
            {
                "id": "1",
                "symbol": "BTCUSDT",
                "entryPrice": 67234.50,
                "exitPrice": None,
                "type": "LONG",
                "status": "OPEN",
                "score": 82,
                "winRate": 96.2,
                "reasoning": "Score 82/100 (bullish) - 1h timeframe >0.5% move - Strong buy signal with liquidation support",
                "entryTime": Date.now() - 3600000,
                "dcaCount": 0,
            },
            {
                "id": "2",
                "symbol": "ETHUSDT",
                "entryPrice": 3456.78,
                "exitPrice": 3589.12,
                "type": "LONG",
                "status": "CLOSED",
                "score": 78,
                "winRate": 94.8,
                "reasoning": "Score 78/100 - Strong momentum with whale inflows detected",
                "entryTime": Date.now() - 7200000,
                "exitTime": Date.now() - 5400000,
                "profit": 3.83,
                "dcaCount": 0,
            },
        ][:limit]
