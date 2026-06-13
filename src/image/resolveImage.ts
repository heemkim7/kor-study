import type { WordImage } from '../content/types'

export function resolveImageSrc(image: WordImage): string {
  if (image.type === 'photo' && image.url) return image.url
  if (image.type === 'fluent' && image.name) return `/img/fluent/${image.name}.png`
  throw new Error('resolveImageSrc: 이미지 정보 부족')
}
