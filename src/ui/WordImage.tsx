import type { Word } from '../content/types'
import { resolveImageSrc } from '../image/resolveImage'

export function WordImage({ word, size = 120 }: { word: Word; size?: number }) {
  return (
    <img src={resolveImageSrc(word.image)} alt={word.text}
      width={size} height={size} style={{ objectFit: 'contain' }} />
  )
}
