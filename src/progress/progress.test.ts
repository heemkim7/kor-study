import { describe, it, expect } from 'vitest'
import { initialProgress, addStars, learnWords, completeLesson, setPrincessName, unlockItem, equipItem, markPlayed, addReviewWord, removeReviewWord, logPlay, setDailyGoal, crackEgg, plantSeed, waterPlant, growGarden, openChest, unlockRoyal, masteryStars, setLessonStars, addFamilyWord, removeFamilyWord, MAX_FAMILY_WORDS, MAX_FAMILY_WORD_LEN, EGG_CRACK_TARGET, PLANT_COST, CHEST_STARS, CHEST_MILESTONE_STARS } from './progress'
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

describe('복습 큐(reviewWords)', () => {
  it('틀린 단어 추가(중복 없음) / 맞히면 제거', () => {
    const a = addReviewWord(initialProgress, 'apple')
    const b = addReviewWord(a, 'apple') // 중복
    expect(b.reviewWords).toEqual(['apple'])
    const c = addReviewWord(b, 'dog')
    expect(c.reviewWords).toEqual(['apple', 'dog'])
    const d = removeReviewWord(c, 'apple')
    expect(d.reviewWords).toEqual(['dog'])
  })
})

describe('playLog / dailyGoal', () => {
  it('하루에 여러 번 기록되면 누적', () => {
    const a = logPlay(initialProgress, '2026-06-15')
    const b = logPlay(a, '2026-06-15')
    const c = logPlay(b, '2026-06-16')
    expect(c.playLog['2026-06-15']).toBe(2)
    expect(c.playLog['2026-06-16']).toBe(1)
  })
  it('하루 목표는 1~5로 제한', () => {
    expect(setDailyGoal(initialProgress, 0).dailyGoal).toBe(1)
    expect(setDailyGoal(initialProgress, 3).dailyGoal).toBe(3)
    expect(setDailyGoal(initialProgress, 9).dailyGoal).toBe(5)
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

describe('알 부화(crackEgg)', () => {
  it('별 1개씩 두드려 임계에서 펫 1마리 부화(별 차감)', () => {
    let p = addStars(initialProgress, EGG_CRACK_TARGET)
    for (let i = 0; i < EGG_CRACK_TARGET - 1; i++) p = crackEgg(p)
    expect(p.hatchedPets).toHaveLength(0)
    expect(p.eggCrackStep).toBe(EGG_CRACK_TARGET - 1)
    p = crackEgg(p) // 임계 도달 → 부화
    expect(p.hatchedPets).toHaveLength(1)
    expect(p.eggCrackStep).toBe(0)
    expect(p.stars).toBe(0)
  })
  it('별 없으면 변화 없음', () => {
    expect(crackEgg(initialProgress)).toBe(initialProgress)
  })
})

describe('마법 정원(plantSeed/waterPlant/growGarden)', () => {
  it('별로 식물 심기(별 차감)', () => {
    const p = plantSeed(addStars(initialProgress, PLANT_COST), 'pl-rose')
    expect(p.garden).toEqual([{ plantId: 'pl-rose', stage: 0 }])
    expect(p.stars).toBe(0)
  })
  it('별 부족·알 수 없는 식물이면 변화 없음', () => {
    expect(plantSeed(initialProgress, 'pl-rose')).toBe(initialProgress)
    const rich = addStars(initialProgress, PLANT_COST)
    expect(plantSeed(rich, 'no-such')).toBe(rich)
  })
  it('레슨 완료로 정원이 한 단계씩 자람(상한 2)', () => {
    let p = plantSeed(addStars(initialProgress, PLANT_COST), 'pl-rose')
    p = growGarden(p); expect(p.garden[0].stage).toBe(1)
    p = growGarden(p); expect(p.garden[0].stage).toBe(2)
    expect(growGarden(p)).toBe(p) // 만개면 변화 없음
  })
  it('물주기는 무료로 한 단계 성장', () => {
    const p = waterPlant(plantSeed(addStars(initialProgress, PLANT_COST), 'pl-rose'), 0)
    expect(p.garden[0].stage).toBe(1)
  })
  it('빈 정원은 growGarden 변화 없음', () => {
    expect(growGarden(initialProgress)).toBe(initialProgress)
  })
})

describe('매일 선물상자(openChest)', () => {
  it('하루 1회 별 지급, 같은 날 재호출은 멱등', () => {
    const a = openChest(initialProgress, '2026-06-19')
    expect(a.stars).toBe(CHEST_STARS)
    expect(a.lastChestDate).toBe('2026-06-19')
    expect(openChest(a, '2026-06-19')).toBe(a)
  })
  it('스트릭 7일 마일스톤이면 더 큰 선물', () => {
    const seven = { ...initialProgress, streak: 7 }
    expect(openChest(seven, '2026-06-19').stars).toBe(CHEST_MILESTONE_STARS)
  })
})

describe('실사 공주 룩(unlockRoyal)', () => {
  it('기본 룩은 처음부터 보유', () => {
    expect(initialProgress.royalUnlocked).toContain('pink')
  })
  it('별이 충분하면 해제하고 차감', () => {
    const rich = addStars(initialProgress, 10)
    const p = unlockRoyal(rich, 'blue') // 가격 10
    expect(p.royalUnlocked).toContain('blue')
    expect(p.stars).toBe(0)
  })
  it('별 부족·이미 보유·알수없는 id는 변화 없음', () => {
    expect(unlockRoyal(initialProgress, 'blue')).toBe(initialProgress) // 별 부족
    const rich = addStars(initialProgress, 10)
    expect(unlockRoyal(rich, 'pink')).toBe(rich) // 이미 보유(기본)
    expect(unlockRoyal(rich, 'no-such')).toBe(rich)
  })
})

describe('레슨 마스터리 별(masteryStars/setLessonStars)', () => {
  it('오답 수 → 별: 0=3, 1~2=2, 3+=1', () => {
    expect(masteryStars(0)).toBe(3)
    expect(masteryStars(1)).toBe(2)
    expect(masteryStars(2)).toBe(2)
    expect(masteryStars(3)).toBe(1)
    expect(masteryStars(9)).toBe(1)
  })
  it('최고 기록만 갱신(낮은 별은 무시)', () => {
    const a = setLessonStars(initialProgress, 'fruit-1', 2)
    expect(a.lessonStars['fruit-1']).toBe(2)
    const b = setLessonStars(a, 'fruit-1', 3) // 더 높음 → 갱신
    expect(b.lessonStars['fruit-1']).toBe(3)
    expect(setLessonStars(b, 'fruit-1', 1)).toBe(b) // 더 낮음 → 변화 없음
  })
})

describe('우리 가족 단어(addFamilyWord/removeFamilyWord)', () => {
  it('단어를 추가하고 앞뒤 공백을 다듬는다', () => {
    const a = addFamilyWord(initialProgress, '  김하윤  ')
    expect(a.familyWords).toEqual(['김하윤'])
  })
  it('빈 문자열·중복·너무 긴 단어는 무시(원본 그대로 반환)', () => {
    const a = addFamilyWord(initialProgress, '엄마')
    expect(addFamilyWord(a, '   ')).toBe(a)          // 빈 값
    expect(addFamilyWord(a, '엄마')).toBe(a)          // 중복
    expect(addFamilyWord(a, '가'.repeat(MAX_FAMILY_WORD_LEN + 1))).toBe(a) // 길이 초과
  })
  it('최대 개수를 넘으면 더 추가되지 않는다', () => {
    let p = initialProgress
    for (let i = 0; i < MAX_FAMILY_WORDS; i++) p = addFamilyWord(p, `단어${i}`)
    expect(p.familyWords).toHaveLength(MAX_FAMILY_WORDS)
    const full = addFamilyWord(p, '하나더')
    expect(full).toBe(p)
  })
  it('단어를 지운다(없는 단어는 변화 없음)', () => {
    const a = addFamilyWord(addFamilyWord(initialProgress, '엄마'), '아빠')
    const b = removeFamilyWord(a, '엄마')
    expect(b.familyWords).toEqual(['아빠'])
    expect(removeFamilyWord(a, '없음')).toBe(a)
  })
})
