// 진짜 공주 컬렉션 — 제미나이 웹으로 제작 단계에 생성한 애니메이션풍 오리지널 공주(런타임 비용0).
// 완성된 공주를 통째로 골라 모으는 수집형. 첫 공주는 무료, 나머지는 별로 잠금 해제.
export interface RoyalLook { id: string; name: string; file: string; cost: number }

export const ROYAL_LOOKS: RoyalLook[] = [
  { id: 'rose', name: '장미 공주', file: '/img/royal/looks/rose.webp', cost: 0 },
  { id: 'winter', name: '겨울 공주', file: '/img/royal/looks/winter.webp', cost: 8 },
  { id: 'ocean', name: '인어 공주', file: '/img/royal/looks/ocean.webp', cost: 8 },
  { id: 'garden', name: '꽃 공주', file: '/img/royal/looks/garden.webp', cost: 10 },
  { id: 'sun', name: '햇살 공주', file: '/img/royal/looks/sun.webp', cost: 10 },
  { id: 'star', name: '별빛 공주', file: '/img/royal/looks/star.webp', cost: 12 },
  { id: 'ruby', name: '루비 공주', file: '/img/royal/looks/ruby.webp', cost: 12 },
  { id: 'lavender', name: '라벤더 공주', file: '/img/royal/looks/lavender.webp', cost: 12 },
]

export const DEFAULT_ROYAL = 'rose' // 기본 무료 공주

export function getRoyalLook(id: string): RoyalLook | undefined {
  return ROYAL_LOOKS.find((l) => l.id === id)
}
