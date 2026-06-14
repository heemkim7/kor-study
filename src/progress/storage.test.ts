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

  it('알 수 없는 스티커 id는 걸러내고 유효한 것만 유지', () => {
    localStorage.setItem('hangeul-play:progress:v1', JSON.stringify({
      collectedStickers: ['st-lion', 'no-such-sticker', 'st-star'],
    }))
    const loaded = loadProgress()
    expect(loaded.collectedStickers).toEqual(['st-lion', 'st-star'])
  })

  it('보유하지 않은 outfit 슬롯은 기본값으로 되돌림(손상/구버전 재과금 방지)', () => {
    localStorage.setItem('hangeul-play:progress:v1', JSON.stringify({
      stars: 10,
      ownedItems: ['dress-pink', 'hair-blonde', 'crown-gold', 'acc-none', 'bg-pink'],
      // dress-red는 보유하지 않았는데 입은 것으로 저장됨(손상)
      outfit: { dress: 'dress-red', hair: 'hair-blonde', crown: 'crown-gold', accessory: 'acc-none', background: 'bg-pink' },
    }))
    const loaded = loadProgress()
    expect(loaded.outfit.dress).toBe('dress-pink') // 미보유 → 기본 복귀
    expect(loaded.outfit.hair).toBe('hair-blonde') // 보유 → 유지
  })
})
