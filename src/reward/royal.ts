// 실사(3D 인형 렌더) 공주 — 베이스 위에 투명 악세서리 레이어를 부위별로 겹쳐 꾸미는 종이인형식.
// 제미나이 웹으로 제작 단계에 생성한 정적 이미지(런타임 비용0). 별로 잠금 해제하는 수집형.

/** 악세서리 카테고리(베이스 제외). */
export type RoyalCategory = 'crown' | 'hair' | 'necklace' | 'shoes' | 'hand'

/** 전체 실사 공주 베이스(드레스 통째). */
export interface RoyalBase { id: string; name: string; file: string; cost: number }

/** 베이스 위에 겹치는 투명 악세서리.
 *  좌표는 3:4 미리보기 박스 기준 퍼센트 — xPct=가로 중심, yPct=위 모서리, wPct=너비. */
export interface RoyalItem {
  id: string
  category: RoyalCategory
  name: string
  file: string
  cost: number
  xPct: number
  yPct: number
  wPct: number
}

export const ROYAL_BASES: RoyalBase[] = [
  { id: 'rose', name: '장미 공주', file: '/img/royal/base-rose.webp', cost: 0 },
]

export const DEFAULT_ROYAL = 'rose' // 기본 무료 베이스

// 카테고리 표시 정보(탭 순서). 신발은 '나들이 공주' 베이스 추가 시 복원 예정.
export const ROYAL_CATEGORIES: { key: RoyalCategory; label: string; emoji: string }[] = [
  { key: 'crown', label: '왕관', emoji: '👑' },
  { key: 'hair', label: '머리', emoji: '🎀' },
  { key: 'necklace', label: '목걸이', emoji: '📿' },
]

// 부위별 기본 좌표(아이템마다 미세 조정 가능). 3:4 인형 미리보기 기준(라이브에서 튜닝).
const POS: Record<RoyalCategory, { xPct: number; yPct: number; wPct: number }> = {
  crown: { xPct: 50, yPct: 3, wPct: 27 },
  hair: { xPct: 50, yPct: 5, wPct: 33 },
  necklace: { xPct: 50, yPct: 30, wPct: 23 },
  shoes: { xPct: 50, yPct: 90, wPct: 30 },
  hand: { xPct: 72, yPct: 40, wPct: 15 },
}

function item(id: string, category: RoyalCategory, name: string, cost: number,
  over?: Partial<Pick<RoyalItem, 'xPct' | 'yPct' | 'wPct'>>): RoyalItem {
  return { id, category, name, file: `/img/royal/items/${id}.webp`, cost, ...POS[category], ...over }
}

export const ROYAL_ITEMS: RoyalItem[] = [
  // 왕관 — 머리 꼭대기
  item('crown-pink', 'crown', '핑크 티아라', 0),
  item('crown-gold', 'crown', '황금 왕관', 8),
  // 머리장식 — 머리 둘레
  item('hair-flower', 'hair', '꽃 화관', 8),
  // 목걸이 — 가슴
  item('necklace-heart', 'necklace', '하트 목걸이', 8),
]

// 처음부터 무료로 가지고 있는 악세서리(공주가 허전하지 않게)
export const DEFAULT_ROYAL_ITEMS = ROYAL_ITEMS.filter((i) => i.cost === 0).map((i) => i.id)

export function getRoyalBase(id: string): RoyalBase | undefined {
  return ROYAL_BASES.find((b) => b.id === id)
}

export function getRoyalItem(id: string): RoyalItem | undefined {
  return ROYAL_ITEMS.find((i) => i.id === id)
}

/** 베이스 또는 악세서리로 알려진 id인지(저장값 검증·잠금 해제 검증용). */
export function isKnownRoyalId(id: string): boolean {
  return getRoyalBase(id) !== undefined || getRoyalItem(id) !== undefined
}

/** 잠금 해제 비용(베이스/아이템 공통). 알 수 없는 id면 null. */
export function royalCost(id: string): number | null {
  const b = getRoyalBase(id)
  if (b) return b.cost
  const it = getRoyalItem(id)
  if (it) return it.cost
  return null
}
