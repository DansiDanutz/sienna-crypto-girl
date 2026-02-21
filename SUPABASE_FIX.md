# Supabase API Key Fix - War Room Chat Bot
**Date:** Feb 21, 2026 | **Status:** 🔧 CRITICAL FIX NEEDED

---

## Problem Identified

### API Key Authentication Issues

**All Tests Failed:**
```
❌ curl -H "apikey: KEY" → "Invalid API key"
❌ curl -H "Authorization: Bearer KEY" → "No API key found"
❌ curl -H "apikey" query param → "No API key found"
```

**Root Cause:** Supabase API keys are missing from TOOLS.md or have incorrect headers.

---

## Required Supabase API Keys

### For BRAIN Project (okgwzwdtuhhpoyxyprzg.supabase.co)

| Key Name | Purpose | Status |
|-----------|----------|--------|
| `SUPABASE_ANON_KEY` | Read-only access (public) | ❌ MISSING |
| `SUPABASE_SERVICE_KEY` | Write access (bypass RLS) | ❌ MISSING |

### For BRAIN-2 Project (xhskmqsgtdhehzlvtuns.supabase.co)

| Key Name | Purpose | Status |
|-----------|----------|--------|
| `SUPABASE_ANON_KEY` | Read-only access | ❌ MISSING |
| `SUPABASE_SERVICE_ROLE_KEY` | Write access (bypass RLS) | ❌ MISSING |

---

## How to Get Supabase API Keys

### Option 1: Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard
2. Select project: **okgwzwdtuhhpoyxyprzg** (BRAIN)
3. Go to **Settings** → **API**
4. Click **Generate Service Role Key**
5. Copy key (starts with `eyJhbGciOiJIUzI1NiIs...`)
6. Add to TOOLS.md or environment variables

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Get keys
supabase project api-keys
```

---

## Update TOOLS.md

### After Getting Keys, Add These Lines:

```bash
## Supabase
### Supabase BRAIN (okgwzwdtuhhpoyxyprzg)
- **URL:** https://okgwzwdtuhhpoyxyprzg.supabase.co
- **ANON_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw
- **SERVICE_KEY:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw
```

---

## Environment Variables

### For Vercel (sienna-crypto-girl)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://okgwzwdtuhhpoyxyprzg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw
```

### For Render (sienna-crypto-backend)
```bash
SUPABASE_URL=https://okgwzwdtuhhpoyxyprzg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw
```

---

## Verify Fix

### Test Connection
```bash
# Test BRAIN Supabase connection
curl -X POST "https://okgwzwdtuhhpoyxyprzg.supabase.co/rest/v1/chat_messages" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"channel_id": "test", "content": "Test message", "is_bot": true}'

# Expected response: Successfully inserted
# If error: "Invalid API key" → Key is wrong
```

---

## Next Steps

1. **Get Supabase Service Role Keys** from Supabase Dashboard
2. **Update TOOLS.md** with new keys
3. **Update environment variables** on Vercel and Render
4. **Test connection** with curl command above
5. **Restart War Room chat cron job** to use new keys

---

*Fix Guide by Sienna 🌸 - OpenClaw Red Lobster Agent*
