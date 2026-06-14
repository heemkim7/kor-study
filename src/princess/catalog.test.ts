import { describe, it, expect } from 'vitest'
import {
  CATALOG, CATEGORY_ORDER, CATEGORY_LABEL, DEFAULT_OUTFIT, DEFAULT_OWNED_IDS,
  getItem, itemsByCategory, isKnownItem, type ItemCategory,
} from './catalog'

describe('카탈로그 정합성', () => {
  it('아이템 id가 중복되지 않음', () => {
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('모든 아이템 비용은 0 이상', () => {
    expect(CATALOG.every((i) => i.cost >= 0)).toBe(true)
  })

  it('모든 카테고리에 최소 1개 아이템', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(itemsByCategory(cat).length).toBeGreaterThan(0)
    }
  })

  it('CATEGORY_ORDER와 CATEGORY_LABEL 키가 일치', () => {
    expect([...CATEGORY_ORDER].sort()).toEqual((Object.keys(CATEGORY_LABEL) as ItemCategory[]).sort())
  })

  it('DEFAULT_OWNED_IDS = 비용 0 아이템 전체', () => {
    expect([...DEFAULT_OWNED_IDS].sort()).toEqual(CATALOG.filter((i) => i.cost === 0).map((i) => i.id).sort())
  })

  it('DEFAULT_OUTFIT의 모든 슬롯 id는 실제 아이템이고 기본 보유', () => {
    for (const cat of CATEGORY_ORDER) {
      const id = DEFAULT_OUTFIT[cat]
      expect(isKnownItem(id)).toBe(true)
      expect(getItem(id)!.category).toBe(cat)
      expect(DEFAULT_OWNED_IDS).toContain(id)
    }
  })

  it('각 카테고리에 기본(무료) 아이템이 정확히 하나 이상 존재해 항상 입을 수 있음', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(itemsByCategory(cat).some((i) => i.cost === 0)).toBe(true)
    }
  })
})
