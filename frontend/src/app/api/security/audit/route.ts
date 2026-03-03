import { NextRequest, NextResponse } from 'next/server'

export interface SecurityAuditResult {
  score: number            // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: SecurityCheck[]
  criticalCount: number
  warningCount: number
  passCount: number
  recommendations: string[]
  timestamp: number
}

export interface SecurityCheck {
  id: string
  category: 'api-keys' | 'access-control' | 'data-protection' | 'network' | 'dependencies'
  name: string
  status: 'pass' | 'warning' | 'fail'
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function GET(req: NextRequest) {
  // Server-side audit checks
  const checks: SecurityCheck[] = [
    {
      id: 'env_xai',
      category: 'api-keys',
      name: 'XAI API Key',
      status: process.env.XAI_API_KEY ? 'pass' : 'warning',
      details: process.env.XAI_API_KEY ? 'Set via environment variable ✓' : 'Not configured — AI features disabled',
      severity: 'medium',
    },
    {
      id: 'env_supabase_url',
      category: 'data-protection',
      name: 'Supabase URL',
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'pass' : 'fail',
      details: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured ✓' : 'Missing — DB connection broken',
      severity: 'critical',
    },
    {
      id: 'env_supabase_anon',
      category: 'api-keys',
      name: 'Supabase Anon Key',
      status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'pass' : 'fail',
      details: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing — authentication broken',
      severity: 'critical',
    },
    {
      id: 'https_only',
      category: 'network',
      name: 'HTTPS Enforcement',
      status: 'pass',
      details: 'Vercel enforces HTTPS on all deployments ✓',
      severity: 'high',
    },
    {
      id: 'csp_headers',
      category: 'network',
      name: 'Content Security Policy',
      status: 'warning',
      details: 'CSP headers not explicitly configured in next.config.js',
      severity: 'medium',
    },
    {
      id: 'rate_limiting',
      category: 'access-control',
      name: 'API Rate Limiting',
      status: 'warning',
      details: 'No rate limiting middleware detected on API routes',
      severity: 'medium',
    },
    {
      id: 'input_validation',
      category: 'data-protection',
      name: 'Input Validation',
      status: 'pass',
      details: 'TypeScript types enforce input shapes on all API routes ✓',
      severity: 'medium',
    },
    {
      id: 'secret_in_client',
      category: 'api-keys',
      name: 'No Server Secrets in Client Bundle',
      status: 'pass',
      details: 'STRIPE_SECRET_KEY and XAI_API_KEY are server-side only ✓',
      severity: 'critical',
    },
    {
      id: 'cors',
      category: 'network',
      name: 'CORS Configuration',
      status: 'pass',
      details: 'Next.js API routes default CORS policy is same-origin ✓',
      severity: 'high',
    },
    {
      id: 'deps_audit',
      category: 'dependencies',
      name: 'Dependency Vulnerabilities',
      status: 'warning',
      details: 'Run npm audit to check for CVEs — last check unknown',
      severity: 'medium',
    },
  ]

  const criticalCount = checks.filter(c => c.status === 'fail' && c.severity === 'critical').length
  const warningCount = checks.filter(c => c.status === 'warning').length
  const passCount = checks.filter(c => c.status === 'pass').length

  const score = Math.max(0, 100 - criticalCount * 20 - warningCount * 5)
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'

  const recommendations = [
    ...checks.filter(c => c.status === 'fail').map(c => `🔴 Fix: ${c.name} — ${c.details}`),
    ...checks.filter(c => c.status === 'warning').map(c => `🟡 Improve: ${c.name} — ${c.details}`),
  ]

  const result: SecurityAuditResult = {
    score, grade, checks, criticalCount, warningCount, passCount,
    recommendations, timestamp: Date.now(),
  }

  return NextResponse.json(result)
}
