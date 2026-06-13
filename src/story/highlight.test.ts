import { describe, it, expect } from 'vitest'
import { splitByTargets } from './highlight'

describe('splitByTargets', () => {
  it('타겟 단어를 강조 토큰으로 분리', () => {
    const parts = splitByTargets('곰돌이가 빨간 사과를 땄어요.', ['사과'])
    expect(parts).toEqual([
      { text: '곰돌이가 빨간 ', target: false },
      { text: '사과', target: true },
      { text: '를 땄어요.', target: false },
    ])
  })
  it('타겟이 없으면 통째로 비강조', () => {
    expect(splitByTargets('안녕', ['사과'])).toEqual([{ text: '안녕', target: false }])
  })
  it('문장 맨 앞 타겟', () => {
    expect(splitByTargets('사과가 좋아요', ['사과'])).toEqual([
      { text: '사과', target: true },
      { text: '가 좋아요', target: false },
    ])
  })
  it('문장 맨 끝 타겟', () => {
    expect(splitByTargets('나는 사과', ['사과'])).toEqual([
      { text: '나는 ', target: false },
      { text: '사과', target: true },
    ])
  })
  it('여러 타겟이 번갈아 강조', () => {
    expect(splitByTargets('사과와 포도', ['사과', '포도'])).toEqual([
      { text: '사과', target: true },
      { text: '와 ', target: false },
      { text: '포도', target: true },
    ])
  })
})
