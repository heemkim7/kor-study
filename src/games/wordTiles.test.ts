import { describe, it, expect } from 'vitest'
import { buildSyllableTiles } from './wordTiles'

const id = <T,>(a: T[]) => a // 결정적 테스트용 항등 셔플

describe('buildSyllableTiles', () => {
  it('정답 음절 + 방해 음절 distractors개를 만든다', () => {
    const { answer, tiles } = buildSyllableTiles('사과', ['도', '바', '별'], 1, id)
    expect(answer).toEqual(['사', '과'])
    expect(tiles).toHaveLength(3)
    expect(tiles).toContain('사')
    expect(tiles).toContain('과')
  })

  it('방해 음절에서 정답 음절은 제외한다', () => {
    const { tiles } = buildSyllableTiles('사과', ['사', '과', '도'], 1, id)
    const distractor = tiles.filter((t) => t !== '사' && t !== '과')
    expect(distractor).toEqual(['도'])
  })

  it('중복 음절 단어도 음절을 모두 포함한다 (바나나 → 나 2개)', () => {
    const { answer, tiles } = buildSyllableTiles('바나나', ['도'], 1, id)
    expect(answer).toEqual(['바', '나', '나'])
    expect(tiles.filter((t) => t === '나')).toHaveLength(2)
    expect(tiles).toHaveLength(4)
  })

  it('방해 음절이 없으면 정답 음절만 만든다', () => {
    const { tiles } = buildSyllableTiles('별', [], 1, id)
    expect(tiles).toEqual(['별'])
  })
})
