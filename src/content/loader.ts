import type { Word, Lesson } from './types'
import { WORDS } from './words'
import { LESSONS } from './lessons'

const wordById = new Map(WORDS.map((w) => [w.id, w]))
const lessonById = new Map(LESSONS.map((l) => [l.id, l]))

export function getWord(id: string): Word | undefined {
  return wordById.get(id)
}

export function getWordsByIds(ids: string[]): Word[] {
  return ids.map((id) => wordById.get(id)).filter((w): w is Word => w !== undefined)
}

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id)
}

export function allLessons(): Lesson[] {
  return LESSONS
}

/** 콘텐츠 정합성 검사: 문제 메시지 배열 반환(빈 배열이면 정상) */
export function validateContent(): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const w of WORDS) {
    if (ids.has(w.id)) errors.push(`중복 word id: ${w.id}`)
    ids.add(w.id)
    if (w.image.type === 'fluent' && !w.image.name) errors.push(`${w.id}: fluent name 없음`)
    if (w.image.type === 'photo' && !w.image.url) errors.push(`${w.id}: photo url 없음`)
  }
  for (const l of LESSONS) {
    for (const id of l.targetWords) {
      if (!wordById.has(id)) errors.push(`레슨 ${l.id}: 없는 targetWord ${id}`)
    }
    for (const s of l.story) {
      for (const id of s.targets) {
        if (!wordById.has(id)) errors.push(`레슨 ${l.id} 장면: 없는 target ${id}`)
      }
    }
  }
  return errors
}
