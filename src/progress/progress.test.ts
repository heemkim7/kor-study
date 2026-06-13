import { describe, it, expect } from 'vitest'
import { initialProgress, addStars, learnWords, completeLesson } from './progress'

describe('addStars', () => {
  it('별을 더함(원본 불변)', () => {
    const p = addStars(initialProgress, 3)
    expect(p.stars).toBe(3)
    expect(initialProgress.stars).toBe(0)
  })
})

describe('learnWords', () => {
  it('배운 단어를 중복 없이 합침', () => {
    const p = learnWords(learnWords(initialProgress, ['apple']), ['apple', 'banana'])
    expect(p.learnedWords).toEqual(['apple', 'banana'])
  })
})

describe('completeLesson', () => {
  it('처음 완료하면 스티커 +1, 레슨 기록', () => {
    const p = completeLesson(initialProgress, 'fruit-1')
    expect(p.stickers).toBe(1)
    expect(p.completedLessons).toEqual(['fruit-1'])
  })
  it('이미 완료한 레슨은 스티커 안 줌', () => {
    const once = completeLesson(initialProgress, 'fruit-1')
    const twice = completeLesson(once, 'fruit-1')
    expect(twice.stickers).toBe(1)
    expect(twice.completedLessons).toEqual(['fruit-1'])
  })
})
