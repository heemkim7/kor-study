// 공주 꾸미기 아이템 카탈로그 — 무엇이 존재하는지(렌더 방법은 figure.ts).
// 별(⭐)을 모아 아이템을 해금하고, 가진 아이템은 자유롭게 갈아입을 수 있다.

export type HairId =
  | 'hair-blonde' | 'hair-brown' | 'hair-pink' | 'hair-black' | 'hair-blue'
  | 'hair-twin' | 'hair-bun' | 'hair-bob'
export type DressId = 'dress-pink' | 'dress-blue' | 'dress-purple' | 'dress-mint' | 'dress-peach' | 'dress-red'
export type CrownId = 'crown-gold' | 'crown-flower' | 'crown-star' | 'crown-heart' | 'crown-none'
export type AccessoryId =
  | 'acc-none' | 'acc-wand' | 'acc-wings' | 'acc-necklace'
  | 'acc-glasses' | 'acc-parasol' | 'acc-pet'
export type BackgroundId = 'bg-pink' | 'bg-castle' | 'bg-garden' | 'bg-night' | 'bg-rainbow'

export type ItemCategory = 'hair' | 'dress' | 'crown' | 'accessory' | 'background'

export interface Outfit {
  hair: HairId
  dress: DressId
  crown: CrownId
  accessory: AccessoryId
  background: BackgroundId
}

export interface DressUpItem {
  id: string
  name: string
  category: ItemCategory
  cost: number // 별(⭐) 가격. 0이면 처음부터 보유(기본).
}

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  dress: '드레스',
  hair: '머리',
  crown: '왕관',
  accessory: '아이템',
  background: '배경',
}

export const CATEGORY_ORDER: ItemCategory[] = ['dress', 'hair', 'crown', 'accessory', 'background']

// 아이템 정의. 기본 아이템(cost 0)은 처음부터 보유.
export const CATALOG: DressUpItem[] = [
  // 드레스 색
  { id: 'dress-pink', name: '분홍 드레스', category: 'dress', cost: 0 },
  { id: 'dress-blue', name: '하늘 드레스', category: 'dress', cost: 5 },
  { id: 'dress-purple', name: '보라 드레스', category: 'dress', cost: 5 },
  { id: 'dress-mint', name: '민트 드레스', category: 'dress', cost: 6 },
  { id: 'dress-peach', name: '복숭아 드레스', category: 'dress', cost: 6 },
  { id: 'dress-red', name: '빨강 드레스', category: 'dress', cost: 8 },
  // 머리 — 색(긴 웨이브)
  { id: 'hair-blonde', name: '금발 머리', category: 'hair', cost: 0 },
  { id: 'hair-brown', name: '갈색 머리', category: 'hair', cost: 5 },
  { id: 'hair-pink', name: '분홍 머리', category: 'hair', cost: 6 },
  { id: 'hair-black', name: '검정 머리', category: 'hair', cost: 5 },
  { id: 'hair-blue', name: '하늘 머리', category: 'hair', cost: 8 },
  // 머리 — 스타일
  { id: 'hair-twin', name: '양갈래 머리', category: 'hair', cost: 8 },
  { id: 'hair-bun', name: '올림 머리', category: 'hair', cost: 8 },
  { id: 'hair-bob', name: '단발 머리', category: 'hair', cost: 7 },
  // 왕관
  { id: 'crown-gold', name: '황금 티아라', category: 'crown', cost: 0 },
  { id: 'crown-none', name: '왕관 없음', category: 'crown', cost: 0 },
  { id: 'crown-flower', name: '꽃 화관', category: 'crown', cost: 6 },
  { id: 'crown-star', name: '별 왕관', category: 'crown', cost: 8 },
  { id: 'crown-heart', name: '하트 왕관', category: 'crown', cost: 8 },
  // 아이템(액세서리)
  { id: 'acc-none', name: '없음', category: 'accessory', cost: 0 },
  { id: 'acc-necklace', name: '보석 목걸이', category: 'accessory', cost: 6 },
  { id: 'acc-glasses', name: '동그란 안경', category: 'accessory', cost: 6 },
  { id: 'acc-wand', name: '요술봉', category: 'accessory', cost: 8 },
  { id: 'acc-parasol', name: '레이스 양산', category: 'accessory', cost: 9 },
  { id: 'acc-pet', name: '아기 고양이', category: 'accessory', cost: 10 },
  { id: 'acc-wings', name: '요정 날개', category: 'accessory', cost: 10 },
  // 배경
  { id: 'bg-pink', name: '분홍 방', category: 'background', cost: 0 },
  { id: 'bg-garden', name: '꽃 정원', category: 'background', cost: 6 },
  { id: 'bg-castle', name: '성', category: 'background', cost: 8 },
  { id: 'bg-night', name: '별밤', category: 'background', cost: 8 },
  { id: 'bg-rainbow', name: '무지개', category: 'background', cost: 10 },
]

export const DEFAULT_OUTFIT: Outfit = {
  hair: 'hair-blonde',
  dress: 'dress-pink',
  crown: 'crown-gold',
  accessory: 'acc-none',
  background: 'bg-pink',
}

/** 처음부터 보유한(무료) 아이템 id 목록. */
export const DEFAULT_OWNED_IDS: string[] = CATALOG.filter((i) => i.cost === 0).map((i) => i.id)

export function getItem(id: string): DressUpItem | undefined {
  return CATALOG.find((i) => i.id === id)
}

export function itemsByCategory(cat: ItemCategory): DressUpItem[] {
  return CATALOG.filter((i) => i.category === cat)
}

/** 카탈로그에 정의된 아이템인지(저장값 검증용). */
export function isKnownItem(id: string): boolean {
  return CATALOG.some((i) => i.id === id)
}
