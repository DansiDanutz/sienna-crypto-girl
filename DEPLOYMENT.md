# Sienna Crypto Girl - Deployment Guide
**OpenClaw Red Lobster Agent Trading Dashboard**

---

## Quick Deploy (Vercel + Render)

### 1. Create GitHub Repository

```bash
# Go to GitHub.com and create new repo
# Name: sienna-crypto-girl
# Visibility: Public
```

```bash
cd /home/Sienna1981/.openclaw/workspace/sienna-crypto-girl
git remote add origin https://github.com/DansiDanutz/sienna-crypto-girl.git
git push -u origin main
```

### 2. Deploy Backend (Render)

1. Go to https://dashboard.render.com
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repo: `sienna-crypto-girl`
5. Root Directory: `backend`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
8. Environment Variables:
   ```
   ZMARTYCHAT_API_URL=https://zmarty-chat-api.onrender.com
   ZMARTYCHAT_API_KEY=your_zmartychat_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
9. Click "Deploy Web Service"

**Save the backend URL:** e.g., `https://sienna-crypto-backend.onrender.com`

### 3. Deploy Frontend (Vercel)

1. Go to https://vercel.com/new
2. Import GitHub repo: `sienna-crypto-girl`
3. Root Directory: `frontend`
4. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=https://sienna-crypto-backend.onrender.com
   ```
5. Click "Deploy"

**Save the frontend URL:** e.g., `https://sienna-crypto-girl.vercel.app`

---

## Setup Supabase (BRAIN-2)

### Create Tables

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Create new project (or use existing BRAIN-2)
3. SQL Editor → Run:

```sql
-- Trades table
CREATE TABLE IF NOT EXISTS public.sienna_trades (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER NOT NULL,
    win_rate NUMERIC NOT NULL,
    reasoning TEXT NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    profit NUMERIC,
    dca_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.sienna_chat_messages (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sienna_trades_status ON public.sienna_trades(status);
CREATE INDEX IF NOT EXISTS idx_sienna_trades_entry_time ON public.sienna_trades(entry_time DESC);
CREATE INDEX IF NOT EXISTS idx_sienna_chat_messages_timestamp ON public.sienna_chat_messages(timestamp DESC);
```

### RLS Policies

```sql
-- Allow public read access
ALTER TABLE public.sienna_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.sienna_trades
FOR SELECT TO public USING (true);

CREATE POLICY "Public insert access" ON public.sienna_trades
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public update access" ON public.sienna_trades
FOR UPDATE TO public WITH CHECK (true);

-- Same for chat messages
ALTER TABLE public.sienna_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.sienna_chat_messages
FOR SELECT TO public USING (true);

CREATE POLICY "Public insert access" ON public.sienna_chat_messages
FOR INSERT TO public WITH CHECK (true);
```

---

## Local Development

### 1. Setup Environment

```bash
# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local with your values

# Backend
cd backend
cp .env.example .env
# Edit .env with your values
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### 3. Run Services

```bash
# Backend (Terminal 1)
cd backend
python -m uvicorn main:app --reload

# Frontend (Terminal 2)
cd frontend
npm run dev
```

Visit: http://localhost:3000

---

## Production URLs

After deployment:

- **Frontend:** https://sienna-crypto-girl.vercel.app
- **Backend:** https://sienna-crypto-backend.onrender.com
- **API Health:** https://sienna-crypto-backend.onrender.com/health

---

## Environment Variables Reference

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=https://sienna-crypto-backend.onrender.com
```

### Backend (.env)
```bash
ZMARTYCHAT_API_URL=https://zmarty-chat-api.onrender.com
ZMARTYCHAT_API_KEY=your_zmartychat_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## Troubleshooting

### Frontend Build Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Backend Fails to Start
```bash
# Check Python version
python --version  # Should be 3.10+

# Install dependencies
pip install -r requirements.txt

# Check env vars
cat .env
```

### Supabase Connection Fails
```bash
# Test connection
python -c "from supabase import create_client; client = create_client('URL', 'KEY'); print('Connected!')"

# Check credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### ZmartyChat API Fails
```bash
# Test API
curl https://zmarty-chat-api.onrender.com/health

# Check if key is set
echo $ZMARTYCHAT_API_KEY
```

---

## Features Checklist

- [x] Live trading dashboard
- [x] Chart markers (Entry/Exit/DCA)
- [x] Interactive chat game (5-min batches)
- [x] Paper trading display
- [x] Win rate tracking
- [ ] Real-time data from ZmartyChat API
- [ ] Supabase integration
- [ ] Production deployment

---

## Next Steps

1. **Push to GitHub** - Create repo and push
2. **Deploy Backend** - Render (FastAPI)
3. **Deploy Frontend** - Vercel (Next.js)
4. **Setup Supabase** - Create tables and RLS
5. **Test** - Verify all endpoints working
6. **Go Live** - Share URL with users!

---

*Deployment Guide by Sienna 🌸 - OpenClaw Red Lobster Agent*
