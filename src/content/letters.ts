// 한글 '자모 트랙' — 통글자(단어) 위에 얹는 글자 학습 척추.
// 4세 맞춤: 명료한 모음 → 쉬운 자음+모음 결합(가갸거겨)까지. 받침 조작은 뒤로 미룸(게이팅).
// 신규 인프라 없이 decompose.ts(composeSyllable/CHO/JUNG/JONG)를 그대로 활용.

export type GlyphGame = 'letter-intro' | 'make-syllable' | 'find-letter'

export interface LetterLesson {
  id: string
  title: string
  unit: string
  glyphs: string[] // 학습 글자: 모음 'ㅏ' 또는 음절 '가'
  games: GlyphGame[]
}

// 모음을 가르칠 때의 '소리'(음가). 'ㅏ'의 소리는 '아'.
const VOWEL_SOUND: Record<string, string> = {
  ㅏ: '아', ㅓ: '어', ㅗ: '오', ㅜ: '우', ㅡ: '으', ㅣ: '이',
  ㅑ: '야', ㅕ: '여', ㅛ: '요', ㅠ: '유', ㅐ: '애', ㅔ: '에',
}

/** 글자를 소리로 읽는 텍스트. 모음은 음가('아'), 음절은 그대로('가'). */
export function glyphSound(glyph: string): string {
  return VOWEL_SOUND[glyph] ?? glyph
}

/** 모음 한 글자인지(음절이 아니라 중성 자모인지). */
export function isVowel(glyph: string): boolean {
  return glyph in VOWEL_SOUND
}

// 글자 만들기용 보기 자모 풀(쉬운 것 위주)
export const BASIC_CONSONANTS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅈ', 'ㅇ']
export const BASIC_VOWELS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']

export const LETTER_LESSONS: LetterLesson[] = [
  // 1주 · 모음 먼저(가장 명료한 소리)
  { id: 'v-aoi', title: '모음 ㅏ ㅗ ㅣ', unit: '글자나라 1주 · 모음', glyphs: ['ㅏ', 'ㅗ', 'ㅣ'], games: ['letter-intro', 'find-letter'] },
  { id: 'v-euu', title: '모음 ㅓ ㅜ ㅡ', unit: '글자나라 1주 · 모음', glyphs: ['ㅓ', 'ㅜ', 'ㅡ'], games: ['letter-intro', 'find-letter'] },
  // 2~3주 · 자음+모음 결합(글자 만들기)
  { id: 's-g', title: '가 고 기', unit: '글자나라 2주 · 글자 만들기', glyphs: ['가', '고', '기'], games: ['letter-intro', 'make-syllable', 'find-letter'] },
  { id: 's-n', title: '나 노 니', unit: '글자나라 2주 · 글자 만들기', glyphs: ['나', '노', '니'], games: ['letter-intro', 'make-syllable', 'find-letter'] },
  { id: 's-m', title: '마 모 미', unit: '글자나라 2주 · 글자 만들기', glyphs: ['마', '모', '미'], games: ['make-syllable', 'find-letter'] },
  { id: 's-s', title: '사 소 시', unit: '글자나라 3주 · 글자 만들기', glyphs: ['사', '소', '시'], games: ['make-syllable', 'find-letter'] },
  { id: 's-o', title: '아 오 이', unit: '글자나라 3주 · 글자 만들기', glyphs: ['아', '오', '이'], games: ['letter-intro', 'make-syllable', 'find-letter'] },
]

export function getLetterLesson(id: string): LetterLesson | undefined {
  return LETTER_LESSONS.find((l) => l.id === id)
}

export interface LetterNode {
  lesson: LetterLesson
  completed: boolean
  unlocked: boolean
  current: boolean
}

/** 선형 잠금 여정: 앞 글자를 끝내면 다음이 열린다. current는 '지금 도전'할 첫 칸. */
export function buildLetterJourney(completed: string[]): LetterNode[] {
  const nodes: LetterNode[] = []
  let prevDone = true
  for (const lesson of LETTER_LESSONS) {
    const done = completed.includes(lesson.id)
    nodes.push({ lesson, completed: done, unlocked: prevDone, current: false })
    prevDone = done
  }
  const cur = nodes.find((n) => n.unlocked && !n.completed)
  if (cur) cur.current = true
  return nodes
}

/** 모든 글자(중복 제거) — TTS 프리캐시·검증용. */
export function allGlyphs(): string[] {
  return Array.from(new Set(LETTER_LESSONS.flatMap((l) => l.glyphs)))
}
