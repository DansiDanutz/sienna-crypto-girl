# Vercel Environment Variables - sienna-crypto-girl
**Date:** Feb 20, 2026 | **Status:** 🔧 MANUAL UPDATE REQUIRED

---

## Project Details

- **Vercel Project ID:** `prj_dfklXyBSVskEaOq4iwnYgK7YFRe1`
- **Project Name:** `sienna-crypto-girl`
- **Framework:** Next.js
- **GitHub Repo:** https://github.com/DansiDanutz/sienna-crypto-girl
- **Vercel URL:** (not yet deployed)

---

## Environment Variables Needed

### Frontend Variables (Next.js Public)

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://okgwzwdtuhhpoyxyprzg.supabase.co` | Supabase BRAIN-2 URL (users/auth/credits) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw` | Supabase Anon Key (public access) |
| `NEXT_PUBLIC_BACKEND_URL` | `https://sienna-crypto-backend.vercel.app` (once deployed) | FastAPI backend URL |
| `NEXT_PUBLIC_APP_URL` | `https://sienna-crypto.vercel.app` (once deployed) | Frontend app URL |

### Backend Variables (Render)

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://okgwzwdtuhhpoyxyprzg.supabase.co` | Supabase BRAIN-2 URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHSnasSnvUOKS2MCKsSxcMtV3C-R7Wm6qMw` | Supabase Anon Key |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE0OTM1NCwiZXhwIjoyMDczNzI1MzU0fQ.RzpbKSHqzYt5eFZJrYpFqZoQwD9qK2QZTm7D4g` | Supabase Service Role Key (bypasses RLS) |
| `OPENROUTER_API_KEY` | `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` | OpenRouter API (Sienna/ZmartyChat) |
| `DEEPSEEK_API_KEY` | `sk-909741cb4e0943c994d22103f76b87d0` | DeepSeek V3 API |
| `GEMINI_API_KEY` | `AIzaSyAHHlRuG1ScQijT1m_vZVZ__alRVuUzCRk` | Google Gemini 2.0 Flash API |
| `ZAI_API_KEY` | `4e9471d4c3e744a1982aa5af1b114ce7.f8lbPkqjVUsCHTrr` | Z.ai GLM-4.7 API |
| `STRIPE_SECRET_KEY` | `STRIPE_KEY_REDACTED` | Stripe live key (payments) |

---

## Manual Update Steps

### On Vercel (Frontend)

1. Go to https://vercel.com
2. Select project: **sienna-crypto-girl**
3. Go to **Settings** → **Environment Variables**
4. Add/update these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://okgwzwdtuhhpoyxyprzg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_BACKEND_URL=https://sienna-crypto-backend.vercel.app
   NEXT_PUBLIC_APP_URL=https://sienna-crypto.vercel.app
   ```
5. Click **Save**
6. Go to **Deployments** → **Redeploy** (to apply changes)

### On Render (Backend)

1. Go to https://dashboard.render.com
2. Select service: **sienna-crypto-backend**
3. Go to **Environment**
4. Add/update these variables:
   ```
   SUPABASE_URL=https://okgwzwdtuhhpoyxyprzg.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   OPENROUTER_API_KEY=sk-or-v1-c7763e3dff92...
   DEEPSEEK_API_KEY=sk-909741cb4e0943c99...
   GEMINI_API_KEY=AIzaSyAHHlRuG1ScQijT1m_vZVZ__alRVuUzCRk
   ZAI_API_KEY=4e9471d4c3e744a1982aa5af1b114ce7.f8lbPkqjVUsCHTrr
   STRIPE_SECRET_KEY=sk_live_51PnmqL2LiKdy4qct...
   ```
5. Click **Save Changes**
6. Click **Manual Deploy** → **Deploy Latest Commit**

---

## Deployment Status

### Current State
- ✅ **GitHub Repo:** Created and pushed (18 commits)
- ❌ **Vercel Deployment:** Not yet deployed (GitHub integration issue)
- ❌ **Render Deployment:** Backend not yet deployed
- ❌ **Environment Variables:** Need manual setup

### Programmatic Attempts Failed
- ❌ Vercel API deployment endpoint: Returned 404 (GitHub integration missing)
- ❌ Vercel environment variable API: Returned 404 (project not ready)
- ✅ Project ID Found: `prj_dfklXyBSVskEaOq4iwnYgK7YFRe1`

---

## Why Manual Update Required

Vercel API returns `404` when trying to:
1. Trigger deployment via webhook
2. Update environment variables
3. List environment variables

**Root Cause:** GitHub integration not properly linked to Vercel project.

**Solution:** Manual setup via Vercel dashboard is required to:
1. Connect GitHub repo properly
2. Configure environment variables
3. Trigger initial deployment

---

## Next Steps

### Step 1: Vercel Setup (Do First)
1. Go to Vercel → **Add New Project**
2. Import from GitHub: `DansiDanutz/sienna-crypto-girl`
3. Framework: **Next.js**
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. Add environment variables (see above)
7. Deploy

### Step 2: Render Setup (Do Second)
1. Go to Render → **New Web Service**
2. Connect GitHub repo: `DansiDanutz/sienna-crypto-girl`
2. Root Directory: `backend/`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (see above)
6. Deploy

### Step 3: Verify
1. Visit `https://sienna-crypto.vercel.app` (frontend)
2. Visit `https://sienna-crypto-backend.vercel.app` (backend)
3. Test API: `curl https://sienna-crypto-backend.vercel.app/health`
4. Test frontend: Open in browser, check all features

---

## Summary

### What's Done
✅ Code pushed to GitHub (18 commits)
✅ Project created on Vercel
✅ Environment variables documented
✅ Manual update guide created

### What's Remaining
❌ Connect GitHub repo to Vercel manually
❌ Set environment variables on Vercel
❌ Deploy frontend to Vercel
❌ Deploy backend to Render
❌ Set environment variables on Render
❌ Verify both services are live

---

*Documentation by Sienna 🌸 - OpenClaw Red Lobster Agent*
