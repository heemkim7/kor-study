import { describe, it, expect } from 'vitest'
import { isHangulSyllable, decomposeSyllable, toSyllables, toJamo, getChoseong } from './decompose'

describe('isHangulSyllable', () => {
  it('완성형 한글이면 true, 그 외 false', () => {
    expect(isHangulSyllable('사')).toBe(true)
    expect(isHangulSyllable('A')).toBe(false)
    expect(isHangulSyllable('ㄱ')).toBe(false)
  })
})

describe('decomposeSyllable', () => {
  it('초성/중성/종성으로 분해', () => {
    expect(decomposeSyllable('사')).toEqual({ cho: 'ㅅ', jung: 'ㅏ', jong: '' })
    expect(decomposeSyllable('곰')).toEqual({ cho: 'ㄱ', jung: 'ㅗ', jong: 'ㅁ' })
  })
  it('한글이 아니면 null', () => {
    expect(decomposeSyllable('x')).toBeNull()
  })
})

describe('toSyllables', () => {
  it('음절 배열로 분리', () => {
    expect(toSyllables('사과')).toEqual(['사', '과'])
  })
})

describe('toJamo', () => {
  it('복합 모음을 기본 자모로 분리', () => {
    expect(toJamo('사과', { splitCompound: true })).toEqual(['ㅅ', 'ㅏ', 'ㄱ', 'ㅗ', 'ㅏ'])
  })
  it('기본은 복합 자모 유지', () => {
    expect(toJamo('과')).toEqual(['ㄱ', 'ㅘ'])
  })
  it('쌍자음(ㅆ)도 기본 자모로 분리', () => {
    expect(toJamo('씨', { splitCompound: true })).toEqual(['ㅅ', 'ㅅ', 'ㅣ'])
  })
  it('한글이 아닌 글자는 그대로 통과', () => {
    expect(toJamo('A사')).toEqual(['A', 'ㅅ', 'ㅏ'])
  })
})

describe('getChoseong', () => {
  it('각 음절의 초성', () => {
    expect(getChoseong('사과')).toEqual(['ㅅ', 'ㄱ'])
  })
})
