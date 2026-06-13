import { describe, it, expect } from 'vitest'
import { buildHuntGrid } from './huntGrid'

const id = <T,>(a: T[]) => a

describe('buildHuntGrid', () => {
  it('target을 targetCount개, 전체 size칸을 만든다', () => {
    const grid = buildHuntGrid('사', ['도', '바', '별', '산', '소'], 9, 3, id)
    expect(grid).toHaveLength(9)
    expect(grid.filter((c) => c === '사')).toHaveLength(3)
  })

  it('나머지 칸은 target이 아니다', () => {
    const grid = buildHuntGrid('사', ['도', '바', '별', '산', '소'], 9, 3, id)
    const others = grid.filter((c) => c !== '사')
    expect(others).toHaveLength(6)
    expect(others.every((c) => c !== '사')).toBe(true)
  })

  it('방해 음절에서 target은 제외한다', () => {
    const grid = buildHuntGrid('사', ['사', '도'], 9, 2, id)
    expect(grid.filter((c) => c === '사')).toHaveLength(2)
    expect(grid.filter((c) => c === '도')).toHaveLength(7)
  })
})
