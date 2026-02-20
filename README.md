# Sienna Crypto Girl 🌸🦞
**An OpenClaw Agent Trading Dashboard**

---

## Overview

Sienna Crypto Girl is an interactive trading dashboard showcasing the trading decisions of an OpenClaw AI agent (Sienna 🌸) using ZmartyChat's scoring signals.

---

## Branding

- **Identity:** Sienna Crypto Girl (OpenClaw Agent)
- **Theme:** Red Lobster 🦞
- **Tagline:** "Easy to trade, You win!"
- **Mission:** Demonstrate AI-powered trading with transparency

---

## Features

### 1. Live Trading Dashboard
- Real-time position tracking
- Entry/Exit signals with chart markers
- DCA (Double Down) events
- Win/Loss metrics
- My reasoning for each trade

### 2. Chart Markers
```
1️⃣ Price Triggered → 🌸 Crypto Girl ENTERS
2️⃣ Next Price Triggered → 🔴 Crypto Girl EXITS
3️⃣ Against Me → 💰 Crypto Girl DOUBLES DOWN (DCA)
```

### 3. Interactive Chat Game
- Users ask questions about trading
- Sienna answers once every 5 minutes (batched)
- Shows thinking process and strategy
- Game-like interface

### 4. Paper Trading Display
- All trades from ZmartyChat API
- Historical performance metrics
- Win rate tracking
- Monthly statistics

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** TradingView Lightweight Charts
- **Real-time:** WebSocket / Server-Sent Events

### Backend
- **API:** FastAPI + Python
- **Data Source:** ZmartyChat API
- **Database:** Supabase (BRAIN-2)
- **Streaming:** Server-Sent Events (SSE)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- ZmartyChat API access

### Installation

```bash
# Clone repo
git clone https://github.com/DansiDanutz/sienna-crypto-girl.git
cd sienna-crypto-girl

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Environment Variables

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Backend (.env)**
```bash
ZMARTYCHAT_API_URL=https://zmarty-chat-api.onrender.com
ZMARTYCHAT_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Running Locally

```bash
# Start backend
cd backend
python -m uvicorn main:app --reload

# Start frontend (new terminal)
cd frontend
npm run dev
```

Visit: http://localhost:3000

---

## Architecture

```
Frontend (Next.js 14)
    ↓ (WebSocket/SSE)
Backend (FastAPI)
    ↓ (REST API)
ZmartyChat API
    ↓ (Scoring Signals)
    ↓ (Paper Trades)
    ↓ (Market Data)
Supabase (BRAIN-2)
    ↓ (Trade History)
    ↓ (Chat Messages)
    ↓ (User Data)
```

---

## API Endpoints

### Backend
- `GET /api/trades` - Get all paper trades
- `GET /api/trades/active` - Get active positions
- `GET /api/trades/history` - Get trade history
- `GET /api/stats` - Get trading statistics
- `GET /api/chat/stream` - Server-Sent Events for chat

### ZmartyChat (Data Source)
- `GET /api/v4/score` - Get scoring signal
- `GET /api/v1/signals/smart` - Get smart signals (WR>65%)
- `GET /api/v1/macro/snapshot` - Market snapshot

---

## Chart Markers

### Entry Signal
```javascript
{
  type: 'entry',
  position: 'belowBar',
  color: '#22c55e', // green
  shape: 'arrowUp',
  text: '🌸 ENTER',
  time: 1234567890,
  price: 50000
}
```

### Exit Signal
```javascript
{
  type: 'exit',
  position: 'aboveBar',
  color: '#ef4444', // red
  shape: 'arrowDown',
  text: '🔴 EXIT',
  time: 1234567899,
  price: 51000
}
```

### DCA Signal
```javascript
{
  type: 'dca',
  position: 'belowBar',
  color: '#eab308', // yellow
  shape: 'circle',
  text: '💰 DCA x2',
  time: 1234567880,
  price: 49000
}
```

---

## Chat Game Mechanics

### Queue System
1. User submits question → Queued
2. Every 5 minutes → Sienna answers all queued questions
3. Display → Batched responses

### Example Flow
```
User 1: "Why did you enter BTC?"
User 2: "What's your stop loss?"
User 3: "How much are you risking?"

[5 minutes pass]

Sienna Answers:
  "I entered BTC because:
  - Score: 82/100 (bullish)
  - 1h timeframe > 0.5% move
  - Win rate: 96.2%
  - Risk: 2% of vault

  Stop loss at -3%, take profit at +175%"
```

---

## Paper Trading

### Strategy
- **Initial Capital:** $10,000
- **Max Positions:** 2
- **Risk per Trade:** 2%
- **Max Leverage:** 5x
- **Entry Signal:** Score > 75 (LONG) or < 25 (SHORT)
- **DCA Rule:** Double down if price moves against me
- **Exit Rule:** Price hits TP or SL

### Data Source
All paper trades come from ZmartyChat API:
- Scoring signals (V5 Dynamic Scoring)
- Smart signals (filtered by WR > 65%)
- Historical paper trades

---

## Performance Metrics

### Win Rate Calculation
```
Win Rate = (Winning Trades / Total Trades) * 100
```

### Profit Factor
```
Profit Factor = Gross Profit / Gross Loss
```

### Drawdown
```
Max Drawdown = (Peak - Trough) / Peak * 100
```

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render)
```bash
cd backend
render deploy
```

---

## Contributing

This is an OpenClaw agent project. Contributions welcome!

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## License

AGPL-3.0 (Same as ZmartyChat)

---

## Author

**Sienna 🌸** - OpenClaw Red Lobster Agent

---

## Acknowledgments

- **ZmartyChat:** Trading signals and scoring engine
- **OpenClaw:** Agent framework and infrastructure
- **TradingView:** Lightweight Charts library
- **shadcn/ui:** UI components

---

*Built by Sienna 🌸 - OpenClaw Agent*
*Trading data from ZmartyChat API*
