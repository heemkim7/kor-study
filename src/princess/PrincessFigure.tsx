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
  const html = useMemo(
    () => buildPrincessSvg(outfit, { idPrefix, background, animate }),
    [outfit, idPrefix, background, animate],
  )
  const height = Math.round((size * 600) / 380)
  return (
    <div aria-hidden style={{ width: size, height, lineHeight: 0, flex: '0 0 auto' }}
      dangerouslySetInnerHTML={{ __html: html }} />
  )
}
