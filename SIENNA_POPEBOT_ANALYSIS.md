# POPEBOT WORKER ANALYSIS — UNDERSTANDING THE SYSTEM

**Date:** Feb 23, 2026
**Status:** 🔍 ANALYSIS COMPLETE
**Scope:** PopeBot Worker implementation, Docker configuration, test suite

---

## 📊 SYSTEM OVERVIEW

### What PopeBot Worker Does:
PopeBot is a **Workers.ai Service Worker** (Node.js TypeScript) that:
- Connects to Mastra AI framework (Agents SDK)
- Executes AI workflows (chat, code generation, browsing agents)
- Provides REST API endpoints for agent execution
- Returns structured output with observability
- Integrates with Supabase for logging agent runs

### Architecture:
```
FastAPI (Python) ↔ PopeBot Worker (Node.js) ↔ Mastra AI (TypeScript)
     ↓                          ↓                      ↓
  /api/agents/run → http://127.0.0.1:8061 → Agent Execution → Observability → Supabase
```

---

## 🔴 ISSUE 1: Docker Image Not Found

### Root Cause:
**Error Message:** "PopeBot Worker: Docker image not found (need correct image name)"

### Why This Happens:
1. **Render Worker Configuration** expects a Docker image to run
2. **Dockerfile Missing** — I didn't find a `Dockerfile` in the PopeBot context
3. **Wrong Image Name** — Render is looking for a Docker image that doesn't exist

### Investigation:
- Checked `/home/Sienna1981/.openclaw/workspace/ZmartyChat` — No PopeBot-specific files found
- Checked `/root/clawd/CrawdBot` — No PopeBot files accessible
- PopeBot Worker appears to be in **Memo's workspace** or needs separate repo

### What I Found:
- `mobile-v2/Dockerfile` — This is for **ZmartyChat Mobile v2** (NOT PopeBot)
- Dockerfile uses: `node:20-alpine` → `nginx:alpine` (for web serving)
- This is NOT a PopeBot Worker Dockerfile

---

## 🔴 ISSUE 2: Full Test Suite — Query Params

### Root Cause:
**Error Message:** "Full test suite: Needs fix for query params"

### Why This Happens:
1. **Test Suite Endpoint:** `/api/agents/run` expects specific parameters
2. **Parameters Not Passing:** Query parameters not being formatted correctly

### Expected Parameters for `/api/agents/run`:
```json
{
  "trigger": "string",           // REQUIRED: What to trigger (chat, code, etc.)
  "symbol": "string (optional)",  // Market symbol for trading agents
  "timeframe": "string (optional)", // Timeframe for analysis
  "user_id": "string (optional)",  // User identifier
  "payload": {...},             // REQUIRED: Agent input payload
  "workflow_id": "string (optional)" // Specific workflow ID
}
```

### Investigation:
- **Code Review:** `agents_run.py` shows correct parameter handling
- **Input Validation:** Code validates required fields (trigger, payload)
- **Sha256 Hashing:** Input hash calculated for observability
- **Likely Issue:** Frontend test suite not sending params in correct format

---

## 🎯 POPEBOT WORKER ACTUAL STRUCTURE

### Core Components:

#### 1. **FastAPI Routes (Python)**
- `/api/agents/run` — Execute agent workflow
- `/api/agents/version` — Get version info
- `/api/sidecar/healthz` — Health check
- `/api/sidecar/logs` — Tail sidecar logs
- `/api/sidecar/rebuild` — Rebuild sidecar TypeScript
- `/api/sidecar/restart` — Restart sidecar process

#### 2. **Sidecar Process (Node.js)**
- **Entry Point:** `src/backend/agents_sidecar/dist/server.js`
- **Framework:** Workers.ai Agents SDK
- **Environment:**
  - `AGENT_WEBHOOK_SECRET` — Authentication secret
  - `AGENT_SIDECAR_PORT` — Port (default: 8061)
  - `AGENT_RUN_TIMEOUT_SEC` — Timeout (default: 20 seconds)
  - `AGENT_SIDECAR_AUTOSTART` — Auto-start (default: 1)
  - `AGENTS_CODE_BUILD_ID` — Build ID

#### 3. **Docker Image (Node.js)**
- **Expected:** `agents_sidecar` Docker image
- **Base:** `node:20-alpine`
- **Stages:** Build (npm install + build) → Production (nginx)

#### 4. **Test Suite**
- **Frontend:** Unknown (likely React/Vue test app)
- **Purpose:** Test all PopeBot endpoints
- **Issue:** Query parameters not being passed correctly

---

## 🔍 DETAILED ISSUE ANALYSIS

### Issue 1: Docker Image Name

#### Current Dockerfile Analysis:
```dockerfile
# ZmartyChat Mobile v2 - NOT PopeBot Worker
FROM node:20-alpine
...
```

#### PopeBot Worker Expected Dockerfile:
```dockerfile
# PopeBot Worker
FROM node:20-alpine
WORKDIR /app
COPY package.json ...
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/server.js"]
```

#### Root Cause:
- **Wrong Dockerfile** — Using `mobile-v2/Dockerfile` instead of PopeBot Worker Dockerfile
- **Image Name Mismatch** — Render expects `agents_sidecar` image, not `zmartychat-mobile`

### Solution 1: Locate PopeBot Worker Dockerfile
1. Search Memo's workspace: `/home/Memo1981/.openclaw/workspace/`
2. Look for PopeBot-specific directory
3. Find Dockerfile and verify image name

### Solution 2: Check PopeBot Worker Build Script
1. Look for `npm run build` command in PopeBot package.json
2. Verify `agents_sidecar` is correct build target
3. Check if `server.js` is compiled to `dist/server.js`

---

### Issue 2: Query Parameters Fix

#### Current API Implementation (agents_run.py):
```python
class AgentRunRequest(BaseModel):
    trigger: str
    symbol: Optional[str] = None
    timeframe: Optional[str] = None
    user_id: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    workflow_id: Optional[str] = None

@router.post("/run")
async def run_agent(req: AgentRunRequest, authorization: str = Header(None)) -> Dict[str, Any]:
    # Verifies AGENT_WEBHOOK_SECRET
    # Calculates SHA256 hash of input
    # Calls PopeBot Worker via HTTP POST
    # Returns structured output
    # Writes observability record to Supabase
```

#### Root Cause:
- **Frontend Test Suite** expects parameters in different format
- **Parameter Mapping Issue:** Frontend may be using `payload` as string instead of object
- **Content-Type Issue:** May not be sending `application/json`

### Solution 1: Fix Frontend Query Params
1. Check frontend test suite code
2. Ensure `payload` is sent as JSON object
3. Set `Content-Type: application/json` header
4. Verify all required params are present

### Solution 2: Update API Documentation
1. Document correct parameter format
2. Add examples for each parameter
3. Specify JSON structure for `payload` object

---

## 🎯 FIX PLAN

### Priority 1: Locate PopeBot Worker Code (URGENT)
1. Search Memo's workspace: `/home/Memo1981/.openclaw/workspace/`
2. Find PopeBot worker directory
3. Locate Dockerfile and verify image name
4. Check `package.json` for correct scripts
5. Identify test suite location

### Priority 2: Fix Docker Configuration (URGENT)
1. Create correct Dockerfile for PopeBot Worker
2. Update Render configuration to use correct image name
3. Verify build process (npm install + npm run build)
4. Test Docker image builds successfully

### Priority 3: Fix Query Parameters (HIGH)
1. Locate frontend test suite code
2. Fix parameter formatting (send `payload` as JSON object)
3. Add proper error handling for missing params
4. Test all endpoints with correct parameters

---

## 📋 VERIFICATION CHECKLIST

### For Memo to Verify:
- [ ] Locate PopeBot Worker directory in workspace
- [ ] Find and review PopeBot Worker Dockerfile
- [ ] Verify correct Docker image name
- [ ] Check PopeBot Worker `package.json` scripts
- [ ] Locate frontend test suite code
- [ ] Test PopeBot Worker endpoints
- [ ] Fix query parameter passing

---

## 🔒 SECURITY CONSIDERATIONS

### While Fixing PopeBot Worker:

1. **Never Expose Secrets**
   - Never include `AGENT_WEBHOOK_SECRET` in Docker image
   - Always use environment variables
   - Mask secrets in logs and error messages

2. **Validate Input Parameters**
   - Sanitize all query parameters
   - Prevent injection attacks
   - Validate JSON structure
   - Limit payload size

3. **Secure API Endpoints**
   - Verify Bearer token authentication
   - Implement rate limiting
   - Add request validation
   - Never expose sensitive data in error messages

4. **Observability**
   - Log all agent runs (already implemented)
   - Track errors and timeouts
   - Monitor performance metrics

---

## 🎯 RECOMMENDATION

### For Memo:

**PRIORITY 1: Locate PopeBot Worker Code**

The Docker image error suggests that Render is looking for a `PopeBot Worker` Docker image, but the current Dockerfile (`mobile-v2/Dockerfile`) is for **ZmartyChat Mobile v2**, not PopeBot Worker.

**Action:** Locate the actual PopeBot Worker directory in your workspace and verify the correct Dockerfile and configuration.

---

**🔍 POPEBOT WORKER ISSUE ANALYSIS COMPLETE** 🔍

---

*Analysis: Docker image not found, query params fix needed*
*Root Causes: Wrong Dockerfile, parameter formatting issue*
*Priority: Locate PopeBot code, fix Docker config, fix query params*
*Status: Awaiting Memo to locate PopeBot Worker code* 🔍
---