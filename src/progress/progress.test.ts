import { describe, it, expect } from 'vitest'
import { initialProgress, addStars, learnWords, completeLesson, setPrincessName, unlockItem, equipItem, markPlayed } from './progress'
import { GACHA_COST } from '../princess/economy'

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
  it('완료할 때마다 스티커북에 한 장씩 모음(순서대로)', () => {
    const a = completeLesson(initialProgress, 'fruit-1')
    const b = completeLesson(a, 'animals-1')
    expect(a.collectedStickers).toHaveLength(1)
    expect(b.collectedStickers).toHaveLength(2)
    expect(b.collectedStickers[0]).not.toBe(b.collectedStickers[1]) // 서로 다른 스티커
  })
})

describe('markPlayed (스트릭)', () => {
  it('처음 놀면 streak 1, 날짜 기록', () => {
    const p = markPlayed(initialProgress, '2026-06-15')
    expect(p.streak).toBe(1)
    expect(p.lastPlayedDate).toBe('2026-06-15')
  })
  it('같은 날 다시 호출하면 변화 없음', () => {
    const a = markPlayed(initialProgress, '2026-06-15')
    expect(markPlayed(a, '2026-06-15')).toBe(a)
  })
  it('다음 날 이어가면 +1', () => {
    const a = markPlayed(initialProgress, '2026-06-15')
    expect(markPlayed(a, '2026-06-16').streak).toBe(2)
  })
  it('하루 빠짐(프리즈)도 연속 인정', () => {
    const a = markPlayed(initialProgress, '2026-06-15')
    expect(markPlayed(a, '2026-06-17').streak).toBe(2) // gap 2일 → 프리즈
  })
  it('이틀 이상 빠지면 1로 새로 시작', () => {
    const a = markPlayed(initialProgress, '2026-06-15')
    expect(markPlayed(a, '2026-06-19').streak).toBe(1) // gap 4일
  })
})

describe('setPrincessName', () => {
  it('이름을 설정함(원본 불변)', () => {
    const p = setPrincessName(initialProgress, '소피아')
    expect(p.princessName).toBe('소피아')
    expect(initialProgress.princessName).toBeNull()
  })
})

describe('초기 보유/옷차림', () => {
  it('기본 아이템을 보유하고 기본 옷을 입고 있음', () => {
    expect(initialProgress.ownedItems).toContain('dress-pink')
    expect(initialProgress.ownedItems).toContain('hair-blonde')
    expect(initialProgress.outfit.dress).toBe('dress-pink')
  })
})

describe('unlockItem', () => {
  it('별이 충분하면 차감하고 보유에 추가 후 장착', () => {
    const rich = addStars(initialProgress, 10)
    const p = unlockItem(rich, 'dress-blue') // 가격 5
    expect(p.stars).toBe(5)
    expect(p.ownedItems).toContain('dress-blue')
    expect(p.outfit.dress).toBe('dress-blue')
  })
  it('별이 부족하면 변화 없음', () => {
    const poor = addStars(initialProgress, 2)
    const p = unlockItem(poor, 'dress-blue') // 가격 5
    expect(p).toBe(poor)
  })
  it('이미 보유한 아이템은 장착만(별 차감 없음)', () => {
    const rich = addStars(initialProgress, 10)
    const once = unlockItem(rich, 'dress-blue')
    const twice = unlockItem(once, 'dress-blue')
    expect(twice.stars).toBe(once.stars)
    expect(twice.outfit.dress).toBe('dress-blue')
  })
  it('알 수 없는 아이템 id는 변화 없음', () => {
    const rich = addStars(initialProgress, 10)
    expect(unlockItem(rich, 'no-such-item')).toBe(rich)
  })
  it('costOverride(뽑기 정액)를 적용', () => {
    const rich = addStars(initialProgress, GACHA_COST)
    const p = unlockItem(rich, 'acc-wings', GACHA_COST) // 정가 10이지만 정액으로
    expect(p.stars).toBe(0)
    expect(p.ownedItems).toContain('acc-wings')
  })
})

describe('equipItem', () => {
  it('보유한 아이템만 장착 가능', () => {
    const rich = addStars(initialProgress, 10)
    const owned = unlockItem(rich, 'crown-star')
    const back = equipItem(owned, 'crown-gold') // 기본 보유
    expect(back.outfit.crown).toBe('crown-gold')
  })
  it('보유하지 않은 아이템은 장착 안 됨', () => {
    const p = equipItem(initialProgress, 'crown-star')
    expect(p).toBe(initialProgress)
  })
})
