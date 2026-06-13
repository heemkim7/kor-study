// 공주 꾸미기 경제 로직 — 순수 함수(난수는 주입). 별(⭐)로 아이템을 해금/장착.
import { CATALOG, type DressUpItem, type Outfit } from './catalog'

/** 뽑기 1회 가격(아이템 개별 가격과 무관한 정액). */
export const GACHA_COST = 6

export function isOwned(ownedIds: string[], id: string): boolean {
  return ownedIds.includes(id)
}

export function canAfford(stars: number, cost: number): boolean {
  return stars >= cost
}

/** 아이템을 입은 새 outfit(원본 불변). category 슬롯만 교체. */
export function equip(outfit: Outfit, item: DressUpItem): Outfit {
  return { ...outfit, [item.category]: item.id } as Outfit
}

/** 아직 보유하지 않은(유료) 아이템 목록 — 뽑기 후보. */
export function unownedItems(ownedIds: string[]): DressUpItem[] {
  return CATALOG.filter((i) => i.cost > 0 && !ownedIds.includes(i.id))
}

/**
 * 뽑기: 보유하지 않은 아이템 중 하나를 무작위로 고른다.
 * rand: [0,1) 난수(테스트용으로 주입). 후보가 없으면 null.
 */
export function gachaPick(ownedIds: string[], rand: number): string | null {
  const pool = unownedItems(ownedIds)
  if (pool.length === 0) return null
  const idx = Math.min(pool.length - 1, Math.floor(rand * pool.length))
  return pool[idx].id
}
