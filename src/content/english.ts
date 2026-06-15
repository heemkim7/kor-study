// 영어(ABC) 트랙 — 알파벳 + 예시 단어(이모지). 발음은 브라우저 영어(en-US) 음성.
// 이미지 자산 0(이모지). 한글 부모 목소리 녹음과 분리됨.

export type AbcGame = 'abc-intro' | 'abc-find' | 'abc-trace'

export interface AbcLesson {
  id: string
  title: string
  unit: string
  letters: string[]
  games: AbcGame[]
}

export const ABC_WORD: Record<string, { word: string; emoji: string }> = {
  A: { word: 'Apple', emoji: '🍎' }, B: { word: 'Ball', emoji: '⚽' }, C: { word: 'Cat', emoji: '🐱' },
  D: { word: 'Dog', emoji: '🐶' }, E: { word: 'Egg', emoji: '🥚' }, F: { word: 'Fish', emoji: '🐟' },
  G: { word: 'Grapes', emoji: '🍇' }, H: { word: 'Hat', emoji: '🎩' }, I: { word: 'Ice cream', emoji: '🍦' },
  J: { word: 'Juice', emoji: '🧃' }, K: { word: 'Kite', emoji: '🪁' }, L: { word: 'Lion', emoji: '🦁' },
  M: { word: 'Moon', emoji: '🌙' }, N: { word: 'Nose', emoji: '👃' }, O: { word: 'Orange', emoji: '🍊' },
  P: { word: 'Pig', emoji: '🐷' }, Q: { word: 'Queen', emoji: '👑' }, R: { word: 'Rainbow', emoji: '🌈' },
  S: { word: 'Sun', emoji: '☀️' }, T: { word: 'Tiger', emoji: '🐯' }, U: { word: 'Umbrella', emoji: '☂️' },
  V: { word: 'Van', emoji: '🚐' }, W: { word: 'Watermelon', emoji: '🍉' }, X: { word: 'Fox', emoji: '🦊' },
  Y: { word: 'Yo-yo', emoji: '🪀' }, Z: { word: 'Zebra', emoji: '🦓' },
}

/** 알파벳 글자를 영어 음성으로 읽기 위한 텍스트/언어. */
export function abcSay(letter: string): { text: string; lang: string } {
  return { text: letter, lang: 'en-US' }
}

export const ABC_LESSONS: AbcLesson[] = [
  { id: 'abc-1', title: 'A B C D E', unit: '알파벳 1', letters: ['A', 'B', 'C', 'D', 'E'], games: ['abc-intro', 'abc-find', 'abc-trace'] },
  { id: 'abc-2', title: 'F G H I J', unit: '알파벳 1', letters: ['F', 'G', 'H', 'I', 'J'], games: ['abc-intro', 'abc-find', 'abc-trace'] },
  { id: 'abc-3', title: 'K L M N O', unit: '알파벳 2', letters: ['K', 'L', 'M', 'N', 'O'], games: ['abc-intro', 'abc-find', 'abc-trace'] },
  { id: 'abc-4', title: 'P Q R S T', unit: '알파벳 2', letters: ['P', 'Q', 'R', 'S', 'T'], games: ['abc-intro', 'abc-find', 'abc-trace'] },
  { id: 'abc-5', title: 'U V W X Y Z', unit: '알파벳 3', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'], games: ['abc-intro', 'abc-find', 'abc-trace'] },
]

export function getAbcLesson(id: string): AbcLesson | undefined {
  return ABC_LESSONS.find((l) => l.id === id)
}

export interface AbcNode {
  lesson: AbcLesson
  completed: boolean
  unlocked: boolean
  current: boolean
}

export function buildAbcJourney(completed: string[]): AbcNode[] {
  const nodes: AbcNode[] = []
  let prevDone = true
  for (const lesson of ABC_LESSONS) {
    const done = completed.includes(lesson.id)
    nodes.push({ lesson, completed: done, unlocked: prevDone, current: false })
    prevDone = done
  }
  const cur = nodes.find((n) => n.unlocked && !n.completed)
  if (cur) cur.current = true
  return nodes
}
