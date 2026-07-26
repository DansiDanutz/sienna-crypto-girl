export interface ChatMarkupSegment {
  text: string
  strong: boolean
}

export function parseChatMarkup(content: string): ChatMarkupSegment[] {
  const segments: ChatMarkupSegment[] = []
  const emphasis = /<strong>([\s\S]*?)<\/strong>/g
  let cursor = 0

  for (const match of content.matchAll(emphasis)) {
    const index = match.index ?? 0
    if (index > cursor) {
      segments.push({ text: content.slice(cursor, index), strong: false })
    }
    segments.push({ text: match[1], strong: true })
    cursor = index + match[0].length
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), strong: false })
  }

  return segments.length > 0 ? segments : [{ text: '', strong: false }]
}
