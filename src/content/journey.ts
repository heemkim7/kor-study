import type { Lesson } from './types'

export interface JourneyNode {
  lesson: Lesson
  completed: boolean
  unlocked: boolean // 앞 단계를 깼거나 첫 단계
  current: boolean // 지금 도전할 단계(잠금 해제 + 미완료 중 첫 번째)
}

/** 레벨 순서로 정렬 + 단계 잠금(앞 단계 완료해야 다음 열림) 계산 */
export function buildJourney(lessons: Lesson[], completedIds: string[]): JourneyNode[] {
  const sorted = [...lessons].sort((a, b) => a.level - b.level)
  const nodes = sorted.map((lesson, i) => ({
    lesson,
    completed: completedIds.includes(lesson.id),
    unlocked: i === 0 || completedIds.includes(sorted[i - 1].id),
  }))
  const currentIdx = nodes.findIndex((n) => n.unlocked && !n.completed)
  return nodes.map((n, i) => ({ ...n, current: i === currentIdx }))
}
