import type { Word } from '../content/types'
import { resolveImageSrc } from '../image/resolveImage'

/** 단어 그림: AI 일러스트(/img/word/<name>.webp)가 있으면 그것을, 없으면 기존 이모지(fluent png)로 대체 */
export function WordImage({ word, size = 120 }: { word: Word; size?: number }) {
  const fallback = resolveImageSrc(word.image)
  const art = word.image.type === 'fluent' && word.image.name ? `/img/word/${word.image.name}.webp` : fallback
  return (
    <img src={art} alt={word.text} width={size} height={size} draggable={false}
      onError={(e) => { if (e.currentTarget.src.endsWith(fallback)) return; e.currentTarget.src = fallback }}
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 3px rgba(60,40,20,.2))' }} />
  )
}
