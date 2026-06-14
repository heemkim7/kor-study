import { DEFAULT_OUTFIT, DEFAULT_OWNED_IDS, getItem, type Outfit } from '../princess/catalog'
import { STICKERS } from '../reward/stickers'

export interface Progress {
  stars: number
  stickers: number
  learnedWords: string[]
  completedLessons: string[]
  princessName: string | null
  ownedItems: string[]      // 보유한 꾸미기 아이템 id(기본 포함)
  outfit: Outfit            // 현재 입은 옷차림
  collectedStickers: string[] // 모은 스티커 id(스티커북)
  lastPlayedDate: string | null // 마지막으로 논 날(YYYY-MM-DD, 로컬)
  streak: number            // 연속 놀이 일수
}

export const initialProgress: Progress = {
  stars: 0,
  stickers: 0,
  learnedWords: [],
  completedLessons: [],
  princessName: null,
  ownedItems: [...DEFAULT_OWNED_IDS],
  outfit: { ...DEFAULT_OUTFIT },
  collectedStickers: [],
  lastPlayedDate: null,
  streak: 0,
}

/** 로컬 기준 오늘 날짜 YYYY-MM-DD. */
export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string): number {
  const da = Date.parse(a + 'T00:00:00'), db = Date.parse(b + 'T00:00:00')
  if (Number.isNaN(da) || Number.isNaN(db)) return Infinity
  return Math.round((db - da) / 86400000)
}

/**
 * '오늘 놀았음'을 기록하고 연속 일수 갱신.
 * 4세 배려: 어제뿐 아니라 '하루 빠짐(프리즈)'까지 연속으로 인정, 그 이상 벌어지면 1로 새로 시작(처벌 메시지 없음).
 */
export function markPlayed(p: Progress, today: string): Progress {
  if (p.lastPlayedDate === today) return p
  let streak = 1
  if (p.lastPlayedDate) {
    const gap = daysBetween(p.lastPlayedDate, today)
    if (gap >= 1 && gap <= 2) streak = p.streak + 1 // 어제 or 하루 빠짐 → 이어감
    else if (gap <= 0) streak = p.streak || 1       // 시계 역행 등 방어
  }
  return { ...p, lastPlayedDate: today, streak }
}

export function addStars(p: Progress, n: number): Progress {
  return { ...p, stars: p.stars + n }
}

export function learnWords(p: Progress, ids: string[]): Progress {
  return { ...p, learnedWords: Array.from(new Set([...p.learnedWords, ...ids])) }
}

export function completeLesson(p: Progress, lessonId: string): Progress {
  if (p.completedLessons.includes(lessonId)) return p
  // 완료 순서대로 스티커를 한 장씩 모은다(레슨 수보다 많아지면 순환).
  const sticker = STICKERS[p.completedLessons.length % STICKERS.length]
  const collectedStickers = p.collectedStickers.includes(sticker.id)
    ? p.collectedStickers
    : [...p.collectedStickers, sticker.id]
  return {
    ...p,
    completedLessons: [...p.completedLessons, lessonId],
    stickers: p.stickers + 1,
    collectedStickers,
  }
}

export function setPrincessName(p: Progress, name: string): Progress {
  return { ...p, princessName: name }
}

/** 아이템 장착(보유 중일 때만). 해당 카테고리 슬롯만 교체. */
export function equipItem(p: Progress, itemId: string): Progress {
  const item = getItem(itemId)
  if (!item || !p.ownedItems.includes(itemId)) return p
  // 카탈로그에 있는 id이므로 카테고리 슬롯에 안전하게 들어감.
  return { ...p, outfit: { ...p.outfit, [item.category]: itemId } as Outfit }
}

/**
 * 아이템 해금: 별을 cost만큼 차감하고 보유에 추가 후 바로 장착.
 * costOverride로 뽑기 정액 가격을 적용할 수 있다.
 * 이미 보유 중이면 장착만, 별이 부족하면 변화 없음.
 */
export function unlockItem(p: Progress, itemId: string, costOverride?: number): Progress {
  const item = getItem(itemId)
  if (!item) return p
  if (p.ownedItems.includes(itemId)) return equipItem(p, itemId)
  const cost = costOverride ?? item.cost
  if (p.stars < cost) return p
  return {
    ...p,
    stars: p.stars - cost,
    ownedItems: [...p.ownedItems, itemId],
    outfit: { ...p.outfit, [item.category]: itemId } as Outfit,
  }
}
