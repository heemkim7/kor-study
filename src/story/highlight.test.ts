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
})
