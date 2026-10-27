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

// 꾸미기 v2: 드레스는 AI 인형 일러스트(통짜), 배경은 벡터. 머리·왕관·아이템은 AI 레이어가 준비되면 복귀.
export const CATEGORY_LABEL: Partial<Record<ItemCategory, string>> = {
  dress: '드레스',
  crown: '왕관',
  background: '배경',
}

export const CATEGORY_ORDER: ItemCategory[] = ['dress', 'crown', 'background']

/** AI 왕관 일러스트(투명 webp) → 인형 머리 위 배치(인형 이미지 대비 %). 없는 id(왕관 없음)는 안 그림. */
export const AI_CROWNS: Record<string, { src: string; w: number; top: number }> = {
  'crown-gold': { src: '/img/princess/crowns/crown-gold.webp', w: 36, top: -7.5 },
  'crown-flower': { src: '/img/princess/crowns/crown-flower.webp', w: 38, top: -9.5 },
  'crown-star': { src: '/img/princess/crowns/crown-star.webp', w: 38, top: -8.5 },
  'crown-heart': { src: '/img/princess/crowns/crown-heart.webp', w: 38, top: -9.5 },
  'crown-bow': { src: '/img/princess/crowns/crown-bow.webp', w: 42, top: -8.5 },
}

/** AI 인형 이미지가 있는 드레스 id → 파일(public/img/princess). 없으면 벡터 인형으로 폴백. */
export const AI_DRESS_IMAGES: Record<string, string> = Object.fromEntries(
  ['pink', 'blue', 'purple', 'mint', 'peach', 'red', 'lemon', 'lavender', 'ivory', 'gold', 'orange', 'magenta']
    .map((k) => [`dress-${k}`, `/img/princess/dress-${k}.webp`]),
)

// 아이템 정의. 기본 아이템(cost 0)은 처음부터 보유.
export const CATALOG: DressUpItem[] = [
  // 드레스 색
  { id: 'dress-pink', name: '분홍 드레스', category: 'dress', cost: 0 },
  { id: 'dress-blue', name: '하늘 드레스', category: 'dress', cost: 5 },
  { id: 'dress-purple', name: '보라 드레스', category: 'dress', cost: 5 },
  { id: 'dress-mint', name: '민트 드레스', category: 'dress', cost: 6 },
  { id: 'dress-peach', name: '복숭아 드레스', category: 'dress', cost: 6 },
  { id: 'dress-red', name: '빨강 드레스', category: 'dress', cost: 8 },
  { id: 'dress-lemon', name: '레몬 드레스', category: 'dress', cost: 5 },
  { id: 'dress-lavender', name: '라벤더 드레스', category: 'dress', cost: 6 },
  { id: 'dress-ivory', name: '아이보리 드레스', category: 'dress', cost: 5 },
  { id: 'dress-gold', name: '황금 드레스', category: 'dress', cost: 9 },
  { id: 'dress-orange', name: '주황 드레스', category: 'dress', cost: 5 },
  { id: 'dress-magenta', name: '자홍 드레스', category: 'dress', cost: 6 },
  // 머리 — 색(긴 웨이브)
  // 머리 — 스타일
  // 왕관
  // 아이템(액세서리)
  // 왕관
  { id: 'crown-gold', name: '황금 왕관', category: 'crown', cost: 0 },
  { id: 'crown-none', name: '왕관 없음', category: 'crown', cost: 0 },
  { id: 'crown-flower', name: '꽃 화관', category: 'crown', cost: 6 },
  { id: 'crown-star', name: '별 왕관', category: 'crown', cost: 8 },
  { id: 'crown-heart', name: '하트 왕관', category: 'crown', cost: 8 },
  { id: 'crown-bow', name: '리본 머리띠', category: 'crown', cost: 6 },
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
