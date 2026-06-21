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
  { id: 'autumn', name: '단풍 공주', file: '/img/royal/looks/autumn.webp', cost: 12 },
  { id: 'blossom', name: '봄 공주', file: '/img/royal/looks/blossom.webp', cost: 12 },
  { id: 'candy', name: '사탕 공주', file: '/img/royal/looks/candy.webp', cost: 12 },
  { id: 'forest', name: '숲 공주', file: '/img/royal/looks/forest.webp', cost: 14 },
  { id: 'snow', name: '눈 공주', file: '/img/royal/looks/snow.webp', cost: 14 },
  { id: 'rainbow', name: '무지개 공주', file: '/img/royal/looks/rainbow.webp', cost: 14 },
  { id: 'galaxy', name: '우주 공주', file: '/img/royal/looks/galaxy.webp', cost: 14 },
  { id: 'heart', name: '하트 공주', file: '/img/royal/looks/heart.webp', cost: 14 },
  { id: 'jewel', name: '보석 공주', file: '/img/royal/looks/jewel.webp', cost: 16 },
  { id: 'peacock', name: '공작 공주', file: '/img/royal/looks/peacock.webp', cost: 16 },
]

export const DEFAULT_ROYAL = 'rose' // 기본 무료 공주

export function getRoyalLook(id: string): RoyalLook | undefined {
  return ROYAL_LOOKS.find((l) => l.id === id)
}
