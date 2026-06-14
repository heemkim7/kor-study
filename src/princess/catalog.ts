// 공주 꾸미기 아이템 카탈로그 — 무엇이 존재하는지(렌더 방법은 figure.ts).
// 별(⭐)을 모아 아이템을 해금하고, 가진 아이템은 자유롭게 갈아입을 수 있다.

// 변형이 많아 id는 문자열로 둔다(카탈로그가 단일 출처, figure는 미정의 시 안전 폴백).
export type HairId = string
export type DressId = string
export type CrownId = string
export type AccessoryId = string
export type BackgroundId = string

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
  { id: 'dress-coral', name: '코랄 드레스', category: 'dress', cost: 5 },
  { id: 'dress-lemon', name: '레몬 드레스', category: 'dress', cost: 5 },
  { id: 'dress-lime', name: '연두 드레스', category: 'dress', cost: 5 },
  { id: 'dress-rose', name: '장미 드레스', category: 'dress', cost: 6 },
  { id: 'dress-lavender', name: '라벤더 드레스', category: 'dress', cost: 6 },
  { id: 'dress-emerald', name: '에메랄드 드레스', category: 'dress', cost: 7 },
  { id: 'dress-ivory', name: '아이보리 드레스', category: 'dress', cost: 5 },
  { id: 'dress-gold', name: '황금 드레스', category: 'dress', cost: 9 },
  { id: 'dress-beige', name: '베이지 드레스', category: 'dress', cost: 5 },
  { id: 'dress-orange', name: '주황 드레스', category: 'dress', cost: 5 },
  { id: 'dress-magenta', name: '자홍 드레스', category: 'dress', cost: 6 },
  { id: 'dress-aqua', name: '아쿠아 드레스', category: 'dress', cost: 6 },
  { id: 'dress-navy', name: '남색 드레스', category: 'dress', cost: 7 },
  { id: 'dress-cocoa', name: '코코아 드레스', category: 'dress', cost: 5 },
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
  { id: 'hair-red', name: '빨강 머리', category: 'hair', cost: 6 },
  { id: 'hair-orange', name: '주황 머리', category: 'hair', cost: 6 },
  { id: 'hair-white', name: '백금발 머리', category: 'hair', cost: 8 },
  { id: 'hair-lavender', name: '라벤더 머리', category: 'hair', cost: 7 },
  { id: 'hair-mint', name: '민트 머리', category: 'hair', cost: 7 },
  { id: 'hair-purple', name: '보라 머리', category: 'hair', cost: 7 },
  { id: 'hair-teal', name: '청록 머리', category: 'hair', cost: 7 },
  { id: 'hair-gray', name: '회색 머리', category: 'hair', cost: 6 },
  { id: 'hair-rose', name: '장미 머리', category: 'hair', cost: 7 },
  // 왕관
  { id: 'crown-gold', name: '황금 왕관', category: 'crown', cost: 0 },
  { id: 'crown-none', name: '왕관 없음', category: 'crown', cost: 0 },
  { id: 'crown-flower', name: '꽃 화관', category: 'crown', cost: 6 },
  { id: 'crown-star', name: '별 왕관', category: 'crown', cost: 8 },
  { id: 'crown-heart', name: '하트 왕관', category: 'crown', cost: 8 },
  { id: 'crown-bow', name: '리본 머리띠', category: 'crown', cost: 6 },
  { id: 'crown-catears', name: '고양이 귀', category: 'crown', cost: 7 },
  { id: 'crown-bunnyears', name: '토끼 귀', category: 'crown', cost: 7 },
  { id: 'crown-halo', name: '천사 고리', category: 'crown', cost: 8 },
  { id: 'crown-pearl', name: '진주 티아라', category: 'crown', cost: 9 },
  { id: 'crown-party', name: '고깔 모자', category: 'crown', cost: 6 },
  { id: 'crown-snow', name: '눈꽃 왕관', category: 'crown', cost: 9 },
  { id: 'crown-moon', name: '달 왕관', category: 'crown', cost: 9 },
  // 아이템(액세서리)
  { id: 'acc-none', name: '없음', category: 'accessory', cost: 0 },
  { id: 'acc-necklace', name: '보석 목걸이', category: 'accessory', cost: 6 },
  { id: 'acc-glasses', name: '동그란 안경', category: 'accessory', cost: 6 },
  { id: 'acc-wand', name: '요술봉', category: 'accessory', cost: 8 },
  { id: 'acc-parasol', name: '레이스 양산', category: 'accessory', cost: 9 },
  { id: 'acc-pet', name: '아기 고양이', category: 'accessory', cost: 10 },
  { id: 'acc-wings', name: '요정 날개', category: 'accessory', cost: 10 },
  { id: 'acc-earrings', name: '반짝 귀걸이', category: 'accessory', cost: 5 },
  { id: 'acc-bowtie', name: '나비 넥타이', category: 'accessory', cost: 5 },
  { id: 'acc-sunglasses', name: '선글라스', category: 'accessory', cost: 6 },
  { id: 'acc-cape', name: '공주 망토', category: 'accessory', cost: 9 },
  { id: 'acc-balloon', name: '풍선', category: 'accessory', cost: 6 },
  { id: 'acc-bouquet', name: '꽃다발', category: 'accessory', cost: 7 },
  { id: 'acc-teddy', name: '곰 인형', category: 'accessory', cost: 8 },
  { id: 'acc-starstaff', name: '별 지팡이', category: 'accessory', cost: 9 },
  // 배경
  { id: 'bg-pink', name: '분홍 방', category: 'background', cost: 0 },
  { id: 'bg-garden', name: '꽃 정원', category: 'background', cost: 6 },
  { id: 'bg-castle', name: '성', category: 'background', cost: 8 },
  { id: 'bg-night', name: '별밤', category: 'background', cost: 8 },
  { id: 'bg-rainbow', name: '무지개', category: 'background', cost: 10 },
  { id: 'bg-beach', name: '바닷가', category: 'background', cost: 7 },
  { id: 'bg-snow', name: '눈나라', category: 'background', cost: 7 },
  { id: 'bg-space', name: '우주', category: 'background', cost: 9 },
  { id: 'bg-forest', name: '숲속', category: 'background', cost: 7 },
  { id: 'bg-flower', name: '꽃밭', category: 'background', cost: 7 },
  { id: 'bg-ballroom', name: '무도회장', category: 'background', cost: 10 },
  { id: 'bg-sunset', name: '노을', category: 'background', cost: 7 },
  { id: 'bg-room', name: '아늑한 방', category: 'background', cost: 6 },
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
