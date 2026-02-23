# Vercel Environment Variables - sienna-crypto-girl (CLEAN VERSION - NO SECRETS)

**Date:** Feb 23, 2026 | **Status:** ✅ READY FOR DEPLOYMENT

---

## Project Details

- **Vercel Project ID:** `prj_dfklXyBSVskEaOq4iwnYgK7YFRe1`
- **Project Name:** `sienna-crypto-girl`
- **Framework:** Next.js
- **GitHub Repo:** https://github.com/DansiDanutz/sienna-crypto-girl
- **Vercel URL:** https://sienna-crypto.vercel.app (to be deployed)

---

## Environment Variables Needed

### Frontend Variables (Next.js Public)

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://okgwzwdtuhhpoyxyprzg.supabase.co` | Supabase BRAIN-2 URL (users/auth/credits) |
| `NEXT_PUBLIC_BACKEND_URL` | `https://sienna-crypto-backend.vercel.app` (once deployed) | FastAPI backend URL |
| `NEXT_PUBLIC_APP_URL` | `https://sienna-crypto.vercel.app` (once deployed) | Frontend app URL |

### Backend Variables (Render)

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://okgwzwdtuhhpoyxyprzg.supabase.co` | Supabase BRAIN-2 URL |
| `OPENROUTER_API_KEY` | (Set manually in Vercel Dashboard) | OpenRouter API (Sienna/ZmartyChat) |
| `DEEPSEEK_API_KEY` | (Set manually in Vercel Dashboard) | DeepSeek V3 API |
| `GEMINI_API_KEY` | (Set manually in Vercel Dashboard) | Google Gemini 2.0 Flash API |
| `ZAI_API_KEY` | (Set manually in Vercel Dashboard) | Z.ai GLM-4.7 API |
| `STRIPE_SECRET_KEY` | (Set manually in Vercel Dashboard) | Stripe live key (payments) |
| `SUPABASE_ANON_KEY` | (Set manually in Vercel Dashboard) | Supabase Anon Key |
| `SUPABASE_SERVICE_KEY` | (Set manually in Vercel Dashboard) | Supabase Service Role Key |

---

## Manual Update Steps

### On Vercel (Frontend)

1. Go to https://vercel.com
2. Select project: **sienna-crypto-girl**
3. Go to **Settings** → **Environment Variables**
4. Add/update these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_BACKEND_URL
   NEXT_PUBLIC_APP_URL
   ```
5. Click **Save** and redeploy

### On Render (Backend)

1. Go to https://dashboard.render.com
2. Select service: **sienna-crypto-backend**
3. Go to **Environment** → **Environment Variables**
4. Add/update these variables:
   ```
   SUPABASE_URL
   OPENROUTER_API_KEY
   DEEPSEEK_API_KEY
   GEMINI_API_KEY
   ZAI_API_KEY
   STRIPE_SECRET_KEY
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_KEY
   ```
5. Click **Save Changes** and redeploy

---

## Security Notes

✅ **NO SECRETS IN THIS FILE** - All keys set manually in Vercel/Render dashboards
✅ **Never commit secrets to git** - Use environment variables only
✅ **Rotate keys regularly** - Change API keys every 30-60 days
✅ **Monitor usage** - Track API calls and costs
✅ **Revoke compromised keys** - Immediately revoke any leaked keys

---

## Deployment Status

✅ **Frontend Ready** - sienna-crypto.vercel.app
✅ **Backend Ready** - sienna-crypto-backend.vercel.app
✅ **Environment Variables Documented** - Clean version (no secrets)
✅ **Vercel Configuration Added** - vercel.json created

---

**Ready for Deployment to https://sienna-crypto.vercel.app** 🚀

---

*Created: Feb 23, 2026*
*Status: CLEAN VERSION - NO SECRETS COMMITTED*
