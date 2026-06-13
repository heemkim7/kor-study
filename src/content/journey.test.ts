import { describe, it, expect } from 'vitest'
import { buildJourney } from './journey'
import type { Lesson } from './types'

const L = (id: string, level: number): Lesson => ({
  id, level, title: id, theme: 'food', story: [], targetWords: [], games: [],
})
const lessons = [L('c', 3), L('a', 1), L('b', 2)] // 일부러 뒤섞어서

describe('buildJourney', () => {
  it('레벨 순서로 정렬한다', () => {
    const j = buildJourney(lessons, [])
    expect(j.map((n) => n.lesson.id)).toEqual(['a', 'b', 'c'])
  })

  it('완료 없으면 1단계만 열림+현재, 나머지 잠금', () => {
    const j = buildJourney(lessons, [])
    expect(j.map((n) => n.unlocked)).toEqual([true, false, false])
    expect(j.map((n) => n.current)).toEqual([true, false, false])
  })

  it('1단계 완료하면 2단계가 열리고 현재가 된다', () => {
    const j = buildJourney(lessons, ['a'])
    expect(j.map((n) => n.completed)).toEqual([true, false, false])
    expect(j.map((n) => n.unlocked)).toEqual([true, true, false])
    expect(j.map((n) => n.current)).toEqual([false, true, false])
  })

  it('모두 완료하면 현재 단계는 없다', () => {
    const j = buildJourney(lessons, ['a', 'b', 'c'])
    expect(j.every((n) => n.completed)).toBe(true)
    expect(j.some((n) => n.current)).toBe(false)
  })
})
