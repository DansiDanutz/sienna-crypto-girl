from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import os

class SupabaseService:
    """Service for Supabase database operations"""

    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Optional[Client] = None

        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                print("✅ Supabase connected (BRAIN-2)")
            except Exception as e:
                print(f"❌ Supabase connection failed: {e}")
                self.client = None
        else:
            print("⚠️ Supabase credentials not configured")

    async def save_trade(self, trade: Dict[str, Any]) -> bool:
        """Save a trade to database"""
        if not self.client:
            print("⚠️ Supabase not connected, trade not saved")
            return False

        try:
            result = self.client.table("sienna_trades").insert(trade).execute()
            print(f"✅ Trade saved: {trade.get('id')}")
            return True
        except Exception as e:
            print(f"❌ Error saving trade: {e}")
            return False

    async def save_chat_message(self, message: Dict[str, Any]) -> bool:
        """Save a chat message to database"""
        if not self.client:
            print("⚠️ Supabase not connected, message not saved")
            return False

        try:
            result = self.client.table("sienna_chat_messages").insert(message).execute()
            print(f"✅ Chat message saved: {message.get('id')}")
            return True
        except Exception as e:
            print(f"❌ Error saving chat message: {e}")
            return False

    async def get_chat_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get chat message history"""
        if not self.client:
            return []

        try:
            result = (
                self.client.table("sienna_chat_messages")
                .select("*")
                .order("timestamp", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data
        except Exception as e:
            print(f"❌ Error fetching chat history: {e}")
            return []

    async def get_trade_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get trade history from database"""
        if not self.client:
            return []

        try:
            result = (
                self.client.table("sienna_trades")
                .select("*")
                .order("entryTime", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data
        except Exception as e:
            print(f"❌ Error fetching trade history: {e}")
            return []

    async def get_stats(self) -> Dict[str, Any]:
        """Get trading statistics from database"""
        if not self.client:
            return {
                "winRate": 0,
                "totalTrades": 0,
                "profitFactor": 0,
                "maxDrawdown": 0,
                "totalProfit": 0,
                "currentPositions": 0,
            }

        try:
            # Get all closed trades
            result = (
                self.client.table("sienna_trades")
                .select("*")
                .eq("status", "CLOSED")
                .execute()
            )

            trades = result.data
            total_trades = len(trades)
            wins = [t for t in trades if t.get("profit", 0) > 0]
            losses = [t for t in trades if t.get("profit", 0) <= 0]

            win_rate = (len(wins) / total_trades * 100) if total_trades > 0 else 0

            gross_profit = sum(t.get("profit", 0) for t in wins)
            gross_loss = abs(sum(t.get("profit", 0) for t in losses))

            profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0

            total_profit = sum(t.get("profit", 0) for t in trades)

            # Current positions
            active_result = (
                self.client.table("sienna_trades")
                .select("*")
                .eq("status", "OPEN")
                .execute()
            )
            current_positions = len(active_result.data)

            return {
                "winRate": round(win_rate, 1),
                "totalTrades": total_trades,
                "profitFactor": round(profit_factor, 2),
                "maxDrawdown": 0,  # Would need more complex calculation
                "totalProfit": round(total_profit, 1),
                "currentPositions": current_positions,
            }
        except Exception as e:
            print(f"❌ Error fetching stats: {e}")
            return {
                "winRate": 0,
                "totalTrades": 0,
                "profitFactor": 0,
                "maxDrawdown": 0,
                "totalProfit": 0,
                "currentPositions": 0,
            }
