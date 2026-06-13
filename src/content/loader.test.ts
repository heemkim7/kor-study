import { describe, it, expect } from 'vitest'
import { getWord, getWordsByIds, getLesson, validateContent } from './loader'

describe('getWord', () => {
  it('id로 단어 조회', () => {
    expect(getWord('apple')?.text).toBe('사과')
    expect(getWord('nope')).toBeUndefined()
  })
})

describe('getWordsByIds', () => {
  it('순서대로 단어 반환', () => {
    expect(getWordsByIds(['grape', 'apple']).map((w) => w.text)).toEqual(['포도', '사과'])
  })
})

describe('getLesson', () => {
  it('id로 레슨 조회', () => {
    expect(getLesson('fruit-1')?.targetWords).toEqual(['apple', 'banana', 'grape'])
  })
})

describe('validateContent', () => {
  it('현재 콘텐츠는 오류 없음', () => {
    expect(validateContent()).toEqual([])
  })
})
