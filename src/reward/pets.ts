// 알 부화로 모으는 아기동물(이모지 기반 — 비용0, 추후 AI 이미지로 교체 가능).
// 부화는 무작위가 아니라 '미보유 순서대로 확정 해금'이라 4세에게 도박성 없이 기대감만 준다.
export interface Pet { id: string; emoji: string; name: string }

export const PETS: Pet[] = [
  { id: 'pet-chick', emoji: '🐥', name: '삐약이' },
  { id: 'pet-bunny', emoji: '🐰', name: '깡총이' },
  { id: 'pet-bear', emoji: '🐻', name: '곰곰이' },
  { id: 'pet-cat', emoji: '🐱', name: '야옹이' },
  { id: 'pet-dog', emoji: '🐶', name: '멍이' },
  { id: 'pet-fox', emoji: '🦊', name: '살랑이' },
  { id: 'pet-panda', emoji: '🐼', name: '판단이' },
  { id: 'pet-penguin', emoji: '🐧', name: '뒤뚱이' },
  { id: 'pet-tiger', emoji: '🐯', name: '어흥이' },
  { id: 'pet-unicorn', emoji: '🦄', name: '유니' },
  { id: 'pet-frog', emoji: '🐸', name: '개굴이' },
  { id: 'pet-hamster', emoji: '🐹', name: '햄찌' },
]

export function getPet(id: string): Pet | undefined {
  return PETS.find((p) => p.id === id)
}

/** 아직 부화하지 않은 펫 중 카탈로그 순서상 다음 것의 id(전부 모았으면 null). */
export function nextUnhatchedPet(hatched: string[]): string | null {
  const owned = new Set(hatched)
  return PETS.find((p) => !owned.has(p.id))?.id ?? null
}
