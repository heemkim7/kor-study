import { shuffle } from './choices'

export interface MemoryCard {
  cardId: string
  wordId: string
  kind: 'image' | 'text'
}

/** 단어마다 그림카드+글자카드 두 장을 만들어 섞은 덱. 그림↔글자가 같은 단어면 짝. */
export function buildMemoryDeck(
  wordIds: string[],
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): MemoryCard[] {
  const cards: MemoryCard[] = []
  for (const wordId of wordIds) {
    cards.push({ cardId: `${wordId}:image`, wordId, kind: 'image' })
    cards.push({ cardId: `${wordId}:text`, wordId, kind: 'text' })
  }
  return shuffleFn(cards)
}

/** 두 카드가 짝인지 (같은 단어, 서로 다른 종류) */
export function isPair(a: MemoryCard, b: MemoryCard): boolean {
  return a.wordId === b.wordId && a.kind !== b.kind
}
