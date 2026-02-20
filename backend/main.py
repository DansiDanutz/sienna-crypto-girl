from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import asyncio
import json
from contextlib import asynccontextmanager

from src.services.zmartychat_service import ZmartyChatService
from src.services.supabase_service import SupabaseService
from src.services.chat_service import ChatService

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🌸 Sienna Crypto Girl Backend Starting...")
    yield
    # Shutdown
    print("🌸 Sienna Crypto Girl Backend Shutting Down...")

# Create app
app = FastAPI(
    title="Sienna Crypto Girl API",
    description="OpenClaw Red Lobster Agent Trading API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
zmartychat_service = ZmartyChatService()
supabase_service = SupabaseService()
chat_service = ChatService()

# Models
class Trade(BaseModel):
    id: str
    symbol: str
    entryPrice: float
    exitPrice: Optional[float]
    type: str
    status: str
    score: int
    winRate: float
    reasoning: str
    entryTime: int
    exitTime: Optional[int]
    profit: Optional[float]
    dcaCount: Optional[int]

class ChatMessage(BaseModel):
    id: str
    type: str
    content: str
    timestamp: int

class Stats(BaseModel):
    winRate: float
    totalTrades: int
    profitFactor: float
    maxDrawdown: float
    totalProfit: float
    currentPositions: int

# Routes
@app.get("/")
async def root():
    return {
        "name": "Sienna Crypto Girl API",
        "version": "0.1.0",
        "status": "active",
        "description": "OpenClaw Red Lobster Agent Trading Dashboard"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "sienna-crypto-girl",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/api/trades", response_model=List[Trade])
async def get_trades(limit: int = 20):
    """Get all paper trades from ZmartyChat"""
    try:
        trades = await zmartychat_service.get_trades(limit)
        return trades
    except Exception as e:
        print(f"Error fetching trades: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trades")

@app.get("/api/trades/active", response_model=List[Trade])
async def get_active_trades():
    """Get currently open positions"""
    try:
        trades = await zmartychat_service.get_active_trades()
        return trades
    except Exception as e:
        print(f"Error fetching active trades: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch active trades")

@app.get("/api/trades/history", response_model=List[Trade])
async def get_trade_history(limit: int = 50):
    """Get closed trades history"""
    try:
        trades = await zmartychat_service.get_trade_history(limit)
        return trades
    except Exception as e:
        print(f"Error fetching trade history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trade history")

@app.get("/api/stats", response_model=Stats)
async def get_stats():
    """Get trading statistics"""
    try:
        stats = await zmartychat_service.get_stats()
        return stats
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")

@app.post("/api/chat/queue")
async def queue_chat_message(message: str):
    """Queue a chat message for Sienna to answer"""
    try:
        queued = await chat_service.queue_message(message)
        return {"queued": True, "queue_size": queued}
    except Exception as e:
        print(f"Error queuing message: {e}")
        raise HTTPException(status_code=500, detail="Failed to queue message")

@app.get("/api/chat/stream")
async def chat_stream():
    """Server-Sent Events stream for chat messages"""
    async def event_generator():
        while True:
            messages = await chat_service.get_pending_messages()
            for msg in messages:
                yield f"data: {json.dumps(msg)}\n\n"
            await asyncio.sleep(5)  # Check every 5 seconds

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/api/signals/smart")
async def get_smart_signals():
    """Get smart signals from ZmartyChat (WR > 65%)"""
    try:
        signals = await zmartychat_service.get_smart_signals()
        return signals
    except Exception as e:
        print(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch signals")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
