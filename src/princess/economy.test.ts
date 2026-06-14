import { describe, it, expect } from 'vitest'
import { unownedItems, gachaPick, GACHA_COST } from './economy'
import { DEFAULT_OWNED_IDS, CATALOG } from './catalog'

describe('unownedItems', () => {
  it('기본(무료) 아이템과 보유 아이템은 제외', () => {
    const pool = unownedItems(DEFAULT_OWNED_IDS)
    // 무료 아이템은 후보에 없음
    expect(pool.every((i) => i.cost > 0)).toBe(true)
    // 전체 유료 아이템 수와 일치(아직 아무것도 안 샀으므로)
    const paid = CATALOG.filter((i) => i.cost > 0)
    expect(pool).toHaveLength(paid.length)
  })
  it('이미 산 아이템은 후보에서 빠짐', () => {
    const pool = unownedItems([...DEFAULT_OWNED_IDS, 'dress-blue'])
    expect(pool.find((i) => i.id === 'dress-blue')).toBeUndefined()
  })
})

describe('gachaPick', () => {
  it('보유하지 않은 아이템 id를 반환', () => {
    const id = gachaPick(DEFAULT_OWNED_IDS, 0)
    expect(id).not.toBeNull()
    expect(DEFAULT_OWNED_IDS).not.toContain(id)
  })
  it('rand=0이면 첫 후보, rand≈1이면 마지막 후보', () => {
    const pool = unownedItems(DEFAULT_OWNED_IDS)
    expect(gachaPick(DEFAULT_OWNED_IDS, 0)).toBe(pool[0].id)
    expect(gachaPick(DEFAULT_OWNED_IDS, 0.999)).toBe(pool[pool.length - 1].id)
  })
  it('모두 보유하면 null', () => {
    const allIds = CATALOG.map((i) => i.id)
    expect(gachaPick(allIds, 0.5)).toBeNull()
  })
})

describe('GACHA_COST', () => {
  it('양수 정액', () => {
    expect(GACHA_COST).toBeGreaterThan(0)
  })
})
