// 수개념 트랙(새 과목) — 1~10 세기·수량 비교. 이모지로만 표현해 이미지 자산이 필요 없다(비용 0).
// 4세에 맞춰 native 수사(하나·둘·셋…)로 읽어 준다.

export type NumGame = 'num-intro' | 'count-tap' | 'compare'

export interface NumLesson {
  id: string
  title: string
  unit: string
  numbers: number[]
  games: NumGame[]
}

export const NUMBER_NAMES: Record<number, string> = {
  1: '하나', 2: '둘', 3: '셋', 4: '넷', 5: '다섯',
  6: '여섯', 7: '일곱', 8: '여덟', 9: '아홉', 10: '열',
}

/** 숫자를 소리로 읽는 텍스트(native 수사). */
export function numberName(n: number): string {
  return NUMBER_NAMES[n] ?? String(n)
}

// 세기용 이모지(귀여운 사물). 라운드마다 하나를 골라 n개 보여준다.
export const COUNT_EMOJI = ['🍎', '🐶', '⭐', '🍓', '🐱', '🎈', '🌸', '🐠', '🚗', '🦋']

export const NUMBER_LESSONS: NumLesson[] = [
  { id: 'n-123', title: '1 2 3', unit: '숫자나라 1', numbers: [1, 2, 3], games: ['num-intro', 'count-tap'] },
  { id: 'n-45', title: '4 5', unit: '숫자나라 1', numbers: [4, 5], games: ['num-intro', 'count-tap', 'compare'] },
  { id: 'n-678', title: '6 7 8', unit: '숫자나라 2', numbers: [6, 7, 8], games: ['num-intro', 'count-tap'] },
  { id: 'n-910', title: '9 10', unit: '숫자나라 2', numbers: [9, 10], games: ['num-intro', 'count-tap', 'compare'] },
]

export function getNumberLesson(id: string): NumLesson | undefined {
  return NUMBER_LESSONS.find((l) => l.id === id)
}

export interface NumNode {
  lesson: NumLesson
  completed: boolean
  unlocked: boolean
  current: boolean
}

export function buildNumberJourney(completed: string[]): NumNode[] {
  const nodes: NumNode[] = []
  let prevDone = true
  for (const lesson of NUMBER_LESSONS) {
    const done = completed.includes(lesson.id)
    nodes.push({ lesson, completed: done, unlocked: prevDone, current: false })
    prevDone = done
  }
  const cur = nodes.find((n) => n.unlocked && !n.completed)
  if (cur) cur.current = true
  return nodes
}
