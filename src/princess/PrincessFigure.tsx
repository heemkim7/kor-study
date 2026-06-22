import { useId, useMemo } from 'react'
import { buildPrincessSvg } from './figure'
import type { Outfit } from './catalog'

/** 공주 피규어를 인라인 SVG로 렌더. outfit이 바뀌면 즉시 갈아입는다. */
export function PrincessFigure({ outfit, size = 200, animate = false, background = true }: {
  outfit: Partial<Outfit>
  size?: number
  animate?: boolean
  background?: boolean
}) {
  const rawId = useId()
  const idPrefix = useMemo(() => 'p' + rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId])
  // outfit은 그리드에서 매 렌더 새 객체 리터럴({...outfit, [cat]:id})로 와 참조가 항상 바뀐다.
  // '내용 키'로 비교해 동일 조합이면 무거운 SVG 생성을 건너뛴다(별 애니·리렌더 시 성능).
  const outfitKey = JSON.stringify(outfit)
  const html = useMemo(
    () => buildPrincessSvg(outfit, { idPrefix, background, animate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outfitKey, idPrefix, background, animate],
  )
  const height = Math.round((size * 600) / 380)
  return (
    <div aria-hidden style={{ width: size, height, lineHeight: 0, flex: '0 0 auto' }}
      dangerouslySetInnerHTML={{ __html: html }} />
  )
}
