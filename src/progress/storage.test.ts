import { describe, it, expect, beforeEach } from 'vitest'
import { loadProgress, saveProgress } from './storage'
import { initialProgress } from './progress'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('저장한 진행상황을 그대로 불러옴', () => {
    saveProgress({ ...initialProgress, stars: 5, stickers: 2, learnedWords: ['apple'] })
    const loaded = loadProgress()
    expect(loaded.stars).toBe(5)
    expect(loaded.stickers).toBe(2)
    expect(loaded.learnedWords).toEqual(['apple'])
  })

  it('저장된 값이 없으면 초기값', () => {
    expect(loadProgress()).toEqual(initialProgress)
  })

  it('손상된 값이면 초기값으로 폴백', () => {
    localStorage.setItem('hangeul-play:progress:v1', '{ not json')
    expect(loadProgress()).toEqual(initialProgress)
  })

  it('부분 저장이면 누락 필드는 초기값으로 채움(전방 호환)', () => {
    localStorage.setItem('hangeul-play:progress:v1', JSON.stringify({ stars: 3 }))
    const loaded = loadProgress()
    expect(loaded.stars).toBe(3)
    expect(loaded.stickers).toBe(0)
    expect(loaded.completedLessons).toEqual([])
  })
})
