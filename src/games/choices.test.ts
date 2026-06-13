import { describe, it, expect } from 'vitest'
import { buildChoices } from './choices'

const noShuffle = <T,>(a: T[]) => a // 결정적 테스트

describe('buildChoices', () => {
  it('정답 + 오답으로 count개, 정답 포함', () => {
    const res = buildChoices('apple', ['banana', 'grape', 'dog'], 3, noShuffle)
    expect(res).toHaveLength(3)
    expect(res).toContain('apple')
  })
  it('오답 풀에서 정답은 제외', () => {
    const res = buildChoices('apple', ['apple', 'banana'], 2, noShuffle)
    expect(res.filter((x) => x === 'apple')).toHaveLength(1)
  })
  it('풀이 부족하면 가능한 만큼', () => {
    const res = buildChoices('apple', ['banana'], 4, noShuffle)
    expect(res).toEqual(['apple', 'banana'])
  })
})
