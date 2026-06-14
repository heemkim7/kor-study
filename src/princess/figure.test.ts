import { describe, it, expect } from 'vitest'
import { buildPrincessSvg } from './figure'
import { CATALOG, CATEGORY_ORDER, itemsByCategory, DEFAULT_OUTFIT, type Outfit } from './catalog'

const wrap = (o?: Partial<Outfit>, opts = {}) => buildPrincessSvg(o, { idPrefix: 't', ...opts })

describe('buildPrincessSvg', () => {
  it('유효한 <svg> 문자열을 반환', () => {
    const svg = wrap()
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true)
    expect(svg).toContain('viewBox="0 0 380 600"')
  })

  it('카탈로그의 모든 아이템 조합이 throw 없이 유효한 SVG 생성', () => {
    for (const item of CATALOG) {
      const outfit = { ...DEFAULT_OUTFIT, [item.category]: item.id } as Outfit
      const svg = buildPrincessSvg(outfit, { idPrefix: 'x' })
      expect(svg.startsWith('<svg'), `${item.id} 렌더 실패`).toBe(true)
      expect(svg.length).toBeGreaterThan(500)
    }
  })

  it('알 수 없는 hair/dress id는 기본값으로 폴백(throw 없음)', () => {
    const svg = wrap({ hair: 'no-hair', dress: 'no-dress' } as unknown as Partial<Outfit>)
    expect(svg.startsWith('<svg')).toBe(true)
    // 폴백(금발/분홍 드레스)과 같은 출력
    expect(svg).toBe(wrap({ hair: 'hair-blonde', dress: 'dress-pink' }))
  })

  it('animate=true 시 애니메이션 클래스 포함, 기본은 미포함', () => {
    expect(wrap({}, { animate: true })).toContain('pr-body')
    expect(wrap({}, { animate: true })).toContain('pr-crown')
    expect(wrap({}, { animate: false })).not.toContain('pr-body')
  })

  it('background=false면 배경(그라디언트/배경rect) 생략', () => {
    expect(wrap({}, { background: true })).toContain('url(#t-bg)')
    expect(wrap({}, { background: false })).not.toContain('url(#t-bg)')
  })

  it('각 배경 변형이 서로 다른 마크업 생성', () => {
    const bgs = ['bg-pink', 'bg-garden', 'bg-castle', 'bg-night', 'bg-rainbow'] as const
    const outs = bgs.map((b) => wrap({ background: b }))
    expect(new Set(outs).size).toBe(bgs.length)
  })

  it('crown-none은 왕관 마크업을 추가하지 않아 황금왕관보다 짧다', () => {
    const none = wrap({ crown: 'crown-none' })
    const gold = wrap({ crown: 'crown-gold' })
    expect(none.length).toBeLessThan(gold.length)
  })

  it('액세서리 변형이 각각 출력을 바꾼다(없음과 다름)', () => {
    const none = wrap({ accessory: 'acc-none' })
    for (const acc of ['acc-wand', 'acc-wings', 'acc-necklace', 'acc-glasses', 'acc-parasol', 'acc-pet'] as const) {
      expect(wrap({ accessory: acc }), `${acc}가 출력에 영향 없음`).not.toBe(none)
    }
  })

  it('헤어 스타일(양갈래/올림/단발)이 긴머리와 다른 마크업', () => {
    const long = wrap({ hair: 'hair-blonde' })
    for (const h of ['hair-twin', 'hair-bun', 'hair-bob'] as const) {
      expect(wrap({ hair: h })).not.toBe(long)
    }
  })

  it('카테고리별 모든 아이템이 서로 다른 마크업(색/모양 폴백 누락 감지)', () => {
    for (const cat of CATEGORY_ORDER) {
      const items = itemsByCategory(cat)
      const outs = items.map((it) => buildPrincessSvg({ [cat]: it.id } as Partial<Outfit>, { idPrefix: 't' }))
      expect(new Set(outs).size, `${cat}: 동일 렌더 아이템 존재(팔레트/분기 누락 의심)`).toBe(items.length)
    }
  })
})
