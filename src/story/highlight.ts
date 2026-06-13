export interface TextPart { text: string; target: boolean }

/** 문장을 타겟 단어 텍스트 기준으로 [비강조|강조|...] 토큰으로 분할 */
export function splitByTargets(sentence: string, targetTexts: string[]): TextPart[] {
  const targets = targetTexts.filter(Boolean)
  if (targets.length === 0) return [{ text: sentence, target: false }]
  const parts: TextPart[] = []
  let i = 0
  while (i < sentence.length) {
    const hit = targets.find((t) => sentence.startsWith(t, i))
    if (hit) {
      parts.push({ text: hit, target: true })
      i += hit.length
    } else {
      const last = parts[parts.length - 1]
      if (last && !last.target) last.text += sentence[i]
      else parts.push({ text: sentence[i], target: false })
      i += 1
    }
  }
  return parts
}
