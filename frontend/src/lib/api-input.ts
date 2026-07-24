export function isSafeSymbol(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z0-9][A-Z0-9._-]{0,14}$/i.test(value)
}

export function isFiniteNumber(value: unknown, minimum = 0): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum
}

export function isValidHeadlineList(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length <= 20
    && value.every((headline) => typeof headline === 'string' && headline.length <= 300)
}

export function isValidCandle(value: unknown): value is {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
} {
  if (typeof value !== 'object' || value === null) return false
  const candle = value as Record<string, unknown>
  return isFiniteNumber(candle.time)
    && isFiniteNumber(candle.open)
    && isFiniteNumber(candle.high)
    && isFiniteNumber(candle.low)
    && isFiniteNumber(candle.close)
    && isFiniteNumber(candle.volume)
}

export class ApiInputError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function readBoundedJson(request: Request, maximumBytes = 16_384): Promise<any> {
  const declaredLength = request.headers.get('content-length')
  if (declaredLength !== null && Number(declaredLength) > maximumBytes) {
    throw new ApiInputError('Request body too large.', 413)
  }

  const reader = request.body?.getReader()
  if (!reader) return {}
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maximumBytes) {
      await reader.cancel()
      throw new ApiInputError('Request body too large.', 413)
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes) || '{}')
  } catch {
    throw new ApiInputError('Invalid JSON body.', 400)
  }
}
