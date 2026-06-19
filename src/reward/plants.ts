// 마법 정원에 심는 식물(이모지 3단계 성장 — 비용0). 학습(레슨 완료)할 때마다 한 단계씩 자란다.
export interface Plant { id: string; stages: [string, string, string]; name: string }

export const PLANTS: Plant[] = [
  { id: 'pl-rose', stages: ['🌱', '🌿', '🌹'], name: '장미' },
  { id: 'pl-tulip', stages: ['🌱', '🌿', '🌷'], name: '튤립' },
  { id: 'pl-sun', stages: ['🌱', '🌿', '🌻'], name: '해바라기' },
  { id: 'pl-blossom', stages: ['🌱', '🌿', '🌸'], name: '벚꽃' },
  { id: 'pl-hibiscus', stages: ['🌱', '🌿', '🌺'], name: '꽃' },
  { id: 'pl-cactus', stages: ['🌱', '🌿', '🌵'], name: '선인장' },
  { id: 'pl-tree', stages: ['🌱', '🌿', '🌳'], name: '나무' },
  { id: 'pl-clover', stages: ['🌱', '🌿', '🍀'], name: '클로버' },
]

export const MAX_PLANT_STAGE = 2 // 0:씨앗 → 1:새싹 → 2:꽃

export function getPlant(id: string): Plant | undefined {
  return PLANTS.find((p) => p.id === id)
}
