import { describe, it, expect } from 'vitest'
import { choiceCountForLevel, distractorsForLevel, difficultyStars } from './difficulty'

describe('choiceCountForLevel', () => {
  it('레벨이 오를수록 보기 수가 늘고 4에서 멈춘다', () => {
    expect(choiceCountForLevel(1)).toBe(2)
    expect(choiceCountForLevel(2)).toBe(3)
    expect(choiceCountForLevel(3)).toBe(4)
    expect(choiceCountForLevel(5)).toBe(4)
  })
})

describe('distractorsForLevel', () => {
  it('보기 수 - 1, 최소 1', () => {
    expect(distractorsForLevel(1)).toBe(1)
    expect(distractorsForLevel(2)).toBe(2)
    expect(distractorsForLevel(3)).toBe(3)
    expect(distractorsForLevel(9)).toBe(3)
  })
})

describe('difficultyStars', () => {
  it('1~3 사이', () => {
    expect(difficultyStars(1)).toBe(1)
    expect(difficultyStars(3)).toBe(3)
    expect(difficultyStars(7)).toBe(3)
  })
})
