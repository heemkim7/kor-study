// 공주 꾸미기 뽑기 로직 — 순수 함수(난수는 주입).
// 보유/가격 판정과 장착은 progress.ts(equipItem/unlockItem)로 일원화.
import { CATALOG, type DressUpItem } from './catalog'

/** 뽑기 1회 가격(아이템 개별 가격과 무관한 정액). */
export const GACHA_COST = 6

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
