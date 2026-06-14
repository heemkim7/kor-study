import { describe, it, expect } from 'vitest'
import { numberName, buildNumberJourney, NUMBER_LESSONS } from './numbers'

describe('numberName', () => {
  it('native 수사로 읽음', () => {
    expect(numberName(1)).toBe('하나')
    expect(numberName(5)).toBe('다섯')
    expect(numberName(10)).toBe('열')
  })
})

describe('buildNumberJourney', () => {
  it('첫 칸은 열림·현재, 나머지는 잠김', () => {
    const j = buildNumberJourney([])
    expect(j[0].unlocked).toBe(true)
    expect(j[0].current).toBe(true)
    expect(j[1].unlocked).toBe(false)
  })
  it('앞을 끝내면 다음이 열리고 현재가 이동', () => {
    const j = buildNumberJourney([NUMBER_LESSONS[0].id])
    expect(j[0].completed).toBe(true)
    expect(j[1].unlocked).toBe(true)
    expect(j[1].current).toBe(true)
  })
})
