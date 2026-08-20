import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createRequire } from 'node:module'

import { parseChatMarkup } from '../src/lib/chat-markup.ts'
import { buildSecurityAudit, type SecurityCheck } from '../src/lib/security-audit.ts'

test('chat markup leaves executable HTML as inert text', () => {
  const attack = '<img src=x onerror="globalThis.pwned=true">'
  assert.deepEqual(parseChatMarkup(attack), [{ text: attack, strong: false }])
})

test('chat markup preserves only explicit strong emphasis', () => {
  assert.deepEqual(parseChatMarkup('Safe <strong>emphasis</strong> here'), [
    { text: 'Safe ', strong: false },
    { text: 'emphasis', strong: true },
    { text: ' here', strong: false },
  ])
})

test('deployment config emits the reviewed browser security headers', async () => {
  const require = createRequire(import.meta.url)
  const config = require('../next.config.js')
  assert.equal(config.poweredByHeader, false)
  const rules = await config.headers()
  const globalRule = rules.find((rule: { source: string }) => rule.source === '/(.*)')
  const headers = Object.fromEntries(
    globalRule.headers.map((header: { key: string; value: string }) => [header.key, header.value]),
  )

  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.match(headers['Content-Security-Policy'], /wss:\/\/stream\.binance\.com:9443/)
  assert.equal(headers['X-Frame-Options'], 'DENY')
  assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin')
  assert.match(headers['Permissions-Policy'], /camera=\(\)/)
})

test('CI executes immutable actions and compiles backend Python', () => {
  const workflow = fs.readFileSync(
    path.join(process.cwd(), '..', '.github', 'workflows', 'verify.yml'),
    'utf8',
  )
  assert.doesNotMatch(workflow, /uses:\s+actions\/(?:checkout|setup-node)@v\d+/)
  assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/)
  assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/)
  assert.match(workflow, /python3 -m compileall -q backend/)
  assert.match(workflow, /python3 -m unittest discover -s backend\/test/)
})

test('security audit does not certify unenforced request controls', async () => {
  const auditSource = fs.readFileSync(
    path.join(process.cwd(), 'src', 'lib', 'security-audit.ts'),
    'utf8',
  )

  assert.match(auditSource, /Selected routes use best-effort process-local limits/)
  assert.match(auditSource, /deployment-wide enforcement is not configured/)
  assert.match(auditSource, /Runtime bounds are route-specific/)
  assert.match(auditSource, /TypeScript types alone do not validate request payloads/)
  assert.doesNotMatch(auditSource, /enforce scoped request limits/)
  assert.doesNotMatch(auditSource, /enforce bounded runtime validation/)

  const result = buildSecurityAudit({})
  const checks = new Map<string, SecurityCheck>(result.checks.map((check) => [check.id, check]))
  assert.equal(checks.get('rate_limiting')?.status, 'warning')
  assert.equal(checks.get('input_validation')?.status, 'warning')
  assert.equal(result.warningCount, result.checks.filter((check: { status: string }) => check.status === 'warning').length)
  assert.equal(result.passCount, result.checks.filter((check: { status: string }) => check.status === 'pass').length)
  assert.equal(
    result.criticalCount,
    result.checks.filter(
      (check: { status: string; severity: string }) =>
        check.status === 'fail' && check.severity === 'critical',
    ).length,
  )
  const expectedScore = Math.max(0, 100 - result.criticalCount * 20 - result.warningCount * 5)
  const expectedGrade = expectedScore >= 90 ? 'A' : expectedScore >= 80 ? 'B' : expectedScore >= 70 ? 'C' : expectedScore >= 60 ? 'D' : 'F'
  assert.equal(result.score, expectedScore)
  assert.equal(result.grade, expectedGrade)
})
