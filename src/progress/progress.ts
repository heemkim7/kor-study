import { DEFAULT_OUTFIT, DEFAULT_OWNED_IDS, getItem, type Outfit } from '../princess/catalog'
import { STICKERS } from '../reward/stickers'
import { nextUnhatchedPet } from '../reward/pets'
import { getPlant, MAX_PLANT_STAGE } from '../reward/plants'
import { getRoyalLook, DEFAULT_ROYAL } from '../reward/royal'

// 보상 경제 상수
export const EGG_CRACK_TARGET = 5   // 알을 이만큼 두드리면 부화
export const PLANT_COST = 4         // 정원에 꽃 한 그루 심는 별 값
export const MAX_GARDEN = 12        // 정원 슬롯 수
export const CHEST_STARS = 3        // 매일 선물상자 기본 별
export const CHEST_MILESTONE_STARS = 5 // 스트릭 마일스톤(7일 단위) 선물 별

export interface GardenPlant { plantId: string; stage: number }

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
  reviewWords: string[]     // 틀려서 다시 볼 단어(복습 큐)
  playLog: Record<string, number> // 날짜(YYYY-MM-DD) → 그날 완료한 놀이 수(부모 리포트)
  dailyGoal: number         // 하루 목표 놀이 수(부모 설정, 기본 1)
  hatchedPets: string[]     // 알에서 부화시킨 펫 id(수집)
  eggCrackStep: number      // 현재 알을 두드린 횟수(0~EGG_CRACK_TARGET)
  garden: GardenPlant[]     // 마법 정원에 심은 식물과 성장 단계
  lastChestDate: string | null // 마지막으로 선물상자 연 날(YYYY-MM-DD)
  royalUnlocked: string[]   // 실사 공주 룩 잠금 해제 id(기본 1개 무료)
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
  reviewWords: [],
  playLog: {},
  dailyGoal: 1,
  hatchedPets: [],
  eggCrackStep: 0,
  garden: [],
  lastChestDate: null,
  royalUnlocked: [DEFAULT_ROYAL],
}

/** 오늘 완료한 놀이 수 +1 기록(부모 리포트용). 최근 60일만 보관. */
export function logPlay(p: Progress, today: string): Progress {
  const next = { ...p.playLog, [today]: (p.playLog[today] ?? 0) + 1 }
  const keys = Object.keys(next).sort()
  while (keys.length > 60) { const k = keys.shift()!; delete next[k] }
  return { ...p, playLog: next }
}

/** 하루 목표 놀이 수 설정(1~5). */
export function setDailyGoal(p: Progress, n: number): Progress {
  return { ...p, dailyGoal: Math.max(1, Math.min(5, Math.round(n))) }
}

/** 틀린 단어를 복습 큐에 추가(중복 없이, 최대 30개). */
export function addReviewWord(p: Progress, id: string): Progress {
  if (p.reviewWords.includes(id)) return p
  return { ...p, reviewWords: [...p.reviewWords, id].slice(-30) }
}

/** 복습에서 맞힌 단어를 큐에서 제거. */
export function removeReviewWord(p: Progress, id: string): Progress {
  if (!p.reviewWords.includes(id)) return p
  return { ...p, reviewWords: p.reviewWords.filter((x) => x !== id) }
}

/** 로컬 기준 오늘 날짜 YYYY-MM-DD. */
export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// YYYY-MM-DD를 로컬 자정 Date로 직접 구성해 일수 차를 계산(엔진별 타임존 해석 모호성 제거).
function daysBetween(a: string, b: string): number {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number)
  if (pa.length !== 3 || pb.length !== 3 || [...pa, ...pb].some((n) => !Number.isFinite(n))) return Infinity
  const da = new Date(pa[0], pa[1] - 1, pa[2]).getTime()
  const db = new Date(pb[0], pb[1] - 1, pb[2]).getTime()
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
  // '모은 스티커 수'로 인덱싱 → 글자/단어 레슨이 섞여 완료돼도 어긋남 없이 다음 미보유 스티커를 순서대로 지급.
  const sticker = STICKERS[p.collectedStickers.length % STICKERS.length]
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

// ---- 보상: 알 부화 ----
/** 별 1개로 알을 한 번 두드림. 임계 도달 시 다음 미보유 펫을 '순서대로 확정' 부화(꽝 없음). 별 부족·전부 수집 시 변화 없음. */
export function crackEgg(p: Progress): Progress {
  if (p.stars < 1) return p
  const next = nextUnhatchedPet(p.hatchedPets)
  if (!next) return p // 다 모았음
  const step = p.eggCrackStep + 1
  if (step >= EGG_CRACK_TARGET) {
    return { ...p, stars: p.stars - 1, eggCrackStep: 0, hatchedPets: [...p.hatchedPets, next] }
  }
  return { ...p, stars: p.stars - 1, eggCrackStep: step }
}

// ---- 보상: 마법 정원 ----
/** 별 PLANT_COST개로 빈 슬롯에 식물 심기(별 부족·슬롯 가득·알 수 없는 식물이면 변화 없음). */
export function plantSeed(p: Progress, plantId: string): Progress {
  if (!getPlant(plantId)) return p
  if (p.garden.length >= MAX_GARDEN) return p
  if (p.stars < PLANT_COST) return p
  return { ...p, stars: p.stars - PLANT_COST, garden: [...p.garden, { plantId, stage: 0 }] }
}

/** 식물에 물주기(무료) — 한 단계 성장(상한 MAX_PLANT_STAGE). */
export function waterPlant(p: Progress, index: number): Progress {
  if (index < 0 || index >= p.garden.length) return p
  if (p.garden[index].stage >= MAX_PLANT_STAGE) return p
  return { ...p, garden: p.garden.map((g, i) => (i === index ? { ...g, stage: g.stage + 1 } : g)) }
}

/** 정원 전체 한 단계 성장(레슨 완료 시 호출). 빈 정원·이미 만개면 변화 없음. */
export function growGarden(p: Progress): Progress {
  if (p.garden.length === 0) return p
  let changed = false
  const garden = p.garden.map((g) => {
    if (g.stage < MAX_PLANT_STAGE) { changed = true; return { ...g, stage: g.stage + 1 } }
    return g
  })
  return changed ? { ...p, garden } : p
}

// ---- 보상: 매일 선물상자 ----
/** 오늘 선물상자를 열 수 있는지(하루 1회). */
export function canOpenChest(p: Progress, today: string): boolean {
  return p.lastChestDate !== today
}

/** 하루 1회 선물상자 열기 — 별 보너스(스트릭 7일 단위 마일스톤이면 더). 같은 날 재호출은 멱등. */
export function openChest(p: Progress, today: string): Progress {
  if (p.lastChestDate === today) return p
  const milestone = p.streak > 0 && p.streak % 7 === 0
  const gain = milestone ? CHEST_MILESTONE_STARS : CHEST_STARS
  return { ...p, stars: p.stars + gain, lastChestDate: today }
}

// ---- 보상: 실사 공주 룩 잠금 해제 ----
/** 별로 실사 공주 룩 해제(이미 가졌거나 별 부족·알수없는 id면 변화 없음). */
export function unlockRoyal(p: Progress, id: string): Progress {
  const look = getRoyalLook(id)
  if (!look || p.royalUnlocked.includes(id)) return p
  if (p.stars < look.cost) return p
  return { ...p, stars: p.stars - look.cost, royalUnlocked: [...p.royalUnlocked, id] }
}
