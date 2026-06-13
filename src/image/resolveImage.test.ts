import { describe, it, expect } from 'vitest'
import { resolveImageSrc } from './resolveImage'

describe('resolveImageSrc', () => {
  it('fluent는 번들 경로로', () => {
    expect(resolveImageSrc({ type: 'fluent', name: 'apple' })).toBe('/img/fluent/apple.png')
  })
  it('photo는 url 그대로', () => {
    expect(resolveImageSrc({ type: 'photo', url: 'https://x/y.jpg' })).toBe('https://x/y.jpg')
  })
  it('정보 부족이면 throw', () => {
    expect(() => resolveImageSrc({ type: 'fluent' })).toThrow()
  })
  it('photo url 누락이면 throw', () => {
    expect(() => resolveImageSrc({ type: 'photo' })).toThrow()
  })
})
