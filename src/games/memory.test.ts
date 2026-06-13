import { describe, it, expect } from 'vitest'
import { buildMemoryDeck, isPair } from './memory'

const id = <T,>(a: T[]) => a

describe('buildMemoryDeck', () => {
  it('단어 수 x2 장의 카드를 만든다', () => {
    const deck = buildMemoryDeck(['apple', 'banana', 'grape'], id)
    expect(deck).toHaveLength(6)
  })

  it('각 단어는 그림카드+글자카드 한 장씩', () => {
    const deck = buildMemoryDeck(['apple', 'banana'], id)
    for (const wordId of ['apple', 'banana']) {
      const mine = deck.filter((c) => c.wordId === wordId)
      expect(mine.map((c) => c.kind).sort()).toEqual(['image', 'text'])
    }
  })

  it('cardId는 모두 고유', () => {
    const deck = buildMemoryDeck(['apple', 'banana', 'grape'], id)
    expect(new Set(deck.map((c) => c.cardId)).size).toBe(6)
  })
})

describe('isPair', () => {
  const img = { cardId: 'a:image', wordId: 'apple', kind: 'image' as const }
  const txt = { cardId: 'a:text', wordId: 'apple', kind: 'text' as const }
  const other = { cardId: 'b:text', wordId: 'banana', kind: 'text' as const }

  it('같은 단어 + 다른 종류면 짝', () => {
    expect(isPair(img, txt)).toBe(true)
  })
  it('다른 단어면 짝 아님', () => {
    expect(isPair(img, other)).toBe(false)
  })
  it('같은 종류면 짝 아님', () => {
    expect(isPair(txt, other)).toBe(false)
  })
})
