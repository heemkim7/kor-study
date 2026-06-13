const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const BASE = 0xac00
const LAST = 0xd7a3

const COMPOUND: Record<string, string[]> = {
  'ㅘ': ['ㅗ','ㅏ'], 'ㅙ': ['ㅗ','ㅐ'], 'ㅚ': ['ㅗ','ㅣ'], 'ㅝ': ['ㅜ','ㅓ'],
  'ㅞ': ['ㅜ','ㅔ'], 'ㅟ': ['ㅜ','ㅣ'], 'ㅢ': ['ㅡ','ㅣ'],
  'ㄲ': ['ㄱ','ㄱ'], 'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'],
  'ㄺ': ['ㄹ','ㄱ'], 'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'],
  'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'], 'ㅄ': ['ㅂ','ㅅ'],
}

export function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return code >= BASE && code <= LAST
}

export function decomposeSyllable(ch: string): { cho: string; jung: string; jong: string } | null {
  if (!isHangulSyllable(ch)) return null
  const code = ch.charCodeAt(0) - BASE
  return {
    cho: CHO[Math.floor(code / 588)],
    jung: JUNG[Math.floor((code % 588) / 28)],
    jong: JONG[code % 28],
  }
}

export function toSyllables(text: string): string[] {
  return Array.from(text)
}

function splitBasic(j: string): string[] {
  return COMPOUND[j] ?? [j]
}

export function toJamo(text: string, opts: { splitCompound?: boolean } = {}): string[] {
  const out: string[] = []
  for (const ch of toSyllables(text)) {
    const d = decomposeSyllable(ch)
    if (!d) { out.push(ch); continue }
    const parts = [d.cho, d.jung, ...(d.jong ? [d.jong] : [])]
    for (const p of parts) out.push(...(opts.splitCompound ? splitBasic(p) : [p]))
  }
  return out
}

export function getChoseong(text: string): string[] {
  return toSyllables(text).map((ch) => decomposeSyllable(ch)?.cho ?? ch)
}
