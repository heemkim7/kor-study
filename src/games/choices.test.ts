import { describe, it, expect } from 'vitest'
import { buildChoices, buildSmartChoices } from './choices'

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

describe('buildSmartChoices', () => {
  const theme: Record<string, string> = { a: 'food', b: 'food', c: 'animal', d: 'animal' }
  const sameTheme = (id: string) => theme[id] === theme['a']

  it('선호 티어(같은 테마)를 먼저 채운다', () => {
    const res = buildSmartChoices('a', ['c', 'b', 'd'], 2, [sameTheme], noShuffle)
    expect(res).toContain('a')
    expect(res).toContain('b') // 같은 food가 c/d보다 우선
  })

  it('선호로 못 채우면 나머지에서 보충', () => {
    const res = buildSmartChoices('a', ['c', 'd'], 3, [() => false], noShuffle)
    expect(res).toHaveLength(3)
    expect(res).toContain('a')
  })

  it('정답은 1개만, 중복 없음', () => {
    const res = buildSmartChoices('a', ['a', 'b', 'c'], 3, [], noShuffle)
    expect(res.filter((x) => x === 'a')).toHaveLength(1)
    expect(new Set(res).size).toBe(res.length)
  })

  it('여러 티어를 우선순위대로 채운다(글자수 우선)', () => {
    const len: Record<string, number> = { 사과: 2, 포도: 2, 바나나: 3, 별: 1 }
    const ans = '사과'
    const sameLen = (id: string) => len[id] === len[ans]
    const res = buildSmartChoices(ans, ['바나나', '포도', '별'], 2, [sameLen], noShuffle)
    expect(res).toContain('포도') // 같은 2글자가 먼저
  })
})
