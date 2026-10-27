import { describe, it, expect } from 'vitest'
import { canPlayLesson, lockedCount, FREE_LESSONS_PER_TRACK, FREE_ENTITLEMENT } from './entitlement'

describe('entitlement', () => {
  it('페이월이 꺼져 있으면 모두 무료', () => {
    expect(canPlayLesson(99, FREE_ENTITLEMENT, false)).toBe(true)
    expect(lockedCount(10, FREE_ENTITLEMENT, false)).toBe(0)
  })
  it('페이월이 켜지면 앞쪽 레슨만 무료', () => {
    expect(canPlayLesson(FREE_LESSONS_PER_TRACK - 1, FREE_ENTITLEMENT, true)).toBe(true)
    expect(canPlayLesson(FREE_LESSONS_PER_TRACK, FREE_ENTITLEMENT, true)).toBe(false)
    expect(lockedCount(10, FREE_ENTITLEMENT, true)).toBe(10 - FREE_LESSONS_PER_TRACK)
  })
  it('구독자는 전부 열림', () => {
    expect(canPlayLesson(99, { premium: true }, true)).toBe(true)
    expect(lockedCount(10, { premium: true }, true)).toBe(0)
  })
})
