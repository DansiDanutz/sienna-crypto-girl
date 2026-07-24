import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiInputError, isFiniteNumber, isSafeSymbol, isValidCandle, isValidHeadlineList, readBoundedJson } from '../src/lib/api-input.ts'
import { checkRateLimit } from '../src/lib/rate-limit.ts'

test('financial inputs reject non-finite and negative numbers', () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, -1, '10', null]) {
    assert.equal(isFiniteNumber(value), false)
  }
  assert.equal(isFiniteNumber(0), true)
})

test('symbols and headline lists are bounded', () => {
  assert.equal(isSafeSymbol('BTC-USD'), true)
  assert.equal(isSafeSymbol('../BTC'), false)
  assert.equal(isValidHeadlineList(['a'.repeat(300)]), true)
  assert.equal(isValidHeadlineList(['a'.repeat(301)]), false)
  assert.equal(isValidHeadlineList(Array.from({ length: 21 }, () => 'headline')), false)
})

test('candles reject null and malformed entries before property access', () => {
  assert.equal(isValidCandle(null), false)
  assert.equal(isValidCandle({}), false)
  assert.equal(isValidCandle({ time: 1, open: 2, high: 3, low: 1, close: 2, volume: 4 }), true)
})

test('body reader enforces the byte limit without content-length', async () => {
  const request = new Request('https://example.test', {
    method: 'POST',
    body: JSON.stringify({ payload: 'x'.repeat(100) }),
  })
  await assert.rejects(
    readBoundedJson(request, 32),
    (error: unknown) => error instanceof ApiInputError && error.status === 413,
  )
})

test('rate gate rejects repeated requests from the same forwarded IP', () => {
  const request = new Request('https://example.test', {
    headers: { 'x-forwarded-for': '203.0.113.10' },
  }) as Parameters<typeof checkRateLimit>[0]
  assert.equal(checkRateLimit(request, 'test-financial-compute', 2, 60_000).allowed, true)
  assert.equal(checkRateLimit(request, 'test-financial-compute', 2, 60_000).allowed, true)
  assert.equal(checkRateLimit(request, 'test-financial-compute', 2, 60_000).allowed, false)
})
