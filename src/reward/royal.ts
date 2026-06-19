// 실사(3D 인형 렌더) 공주 룩 — 제미나이 웹으로 제작 단계에 생성한 정적 이미지(런타임 비용0).
// 별로 잠금 해제하는 수집형. 첫 룩은 무료.
export interface RoyalLook { id: string; name: string; file: string; cost: number }

export const ROYAL_LOOKS: RoyalLook[] = [
  { id: 'pink', name: '장미 공주', file: '/img/royal/pink.webp', cost: 0 },
  { id: 'blue', name: '겨울 공주', file: '/img/royal/blue.webp', cost: 10 },
  { id: 'lavender', name: '라벤더 공주', file: '/img/royal/lavender.webp', cost: 10 },
  { id: 'mint', name: '정원 공주', file: '/img/royal/mint.webp', cost: 10 },
]

export const DEFAULT_ROYAL = 'pink' // 기본 무료 룩

export function getRoyalLook(id: string): RoyalLook | undefined {
  return ROYAL_LOOKS.find((l) => l.id === id)
}
