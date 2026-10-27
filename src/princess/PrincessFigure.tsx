import { useId, useMemo } from 'react'
import { buildPrincessSvg, buildBackgroundSvg } from './figure'
import { AI_DRESS_IMAGES, AI_CROWNS, type Outfit } from './catalog'

/** 공주 피규어 렌더. 드레스에 AI 인형 일러스트가 있으면 [배경 SVG + 인형 이미지], 없으면 벡터 인형. */
export function PrincessFigure({ outfit, size = 200, animate = false, background = true }: {
  outfit: Partial<Outfit>
  size?: number
  animate?: boolean
  background?: boolean
}) {
  const rawId = useId()
  const idPrefix = useMemo(() => 'p' + rawId.replace(/[^a-zA-Z0-9]/g, ''), [rawId])
  const aiSrc = outfit.dress ? AI_DRESS_IMAGES[outfit.dress] : undefined
  const bgId = outfit.background
  const crown = outfit.crown ? AI_CROWNS[outfit.crown] : undefined
  // outfit은 그리드에서 매 렌더 새 객체 리터럴({...outfit, [cat]:id})로 와 참조가 항상 바뀐다.
  // '내용 키'로 비교해 동일 조합이면 무거운 SVG 생성을 건너뛴다(별 애니·리렌더 시 성능).
  const outfitKey = JSON.stringify(outfit)
  const html = useMemo(
    () => aiSrc
      ? (background ? buildBackgroundSvg(bgId ?? 'bg-pink', idPrefix) : '')
      : buildPrincessSvg(outfit, { idPrefix, background, animate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outfitKey, idPrefix, background, animate, aiSrc, bgId],
  )
  const height = Math.round((size * 600) / 380)
  if (aiSrc) {
    return (
      <div aria-hidden style={{ position: 'relative', width: size, height, lineHeight: 0, flex: '0 0 auto', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
        <style>{'@keyframes pr-ai-sway{0%,100%{transform:translateX(-50%) rotate(-1deg)}50%{transform:translateX(-50%) rotate(1deg) translateY(-3px)}}@media (prefers-reduced-motion:reduce){.pr-ai{animation:none!important}}'}</style>
        <div className="pr-ai"
          style={{ position: 'absolute', left: '50%', bottom: '3%', width: '96%',
            transform: 'translateX(-50%)', transformOrigin: '50% 100%',
            filter: 'drop-shadow(0 6px 6px rgba(80,40,70,0.22))',
            animation: animate ? 'pr-ai-sway 4.2s ease-in-out infinite' : undefined }}>
          <img src={aiSrc} alt="" draggable={false} style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }} />
          {crown && (
            <img src={crown.src} alt="" draggable={false}
              style={{ position: 'absolute', left: '51%', top: `${crown.top}%`, width: `${crown.w}%`, height: 'auto',
                transform: 'translateX(-50%)', userSelect: 'none' }} />
          )}
        </div>
      </div>
    )
  }
  return (
    <div aria-hidden style={{ width: size, height, lineHeight: 0, flex: '0 0 auto' }}
      dangerouslySetInnerHTML={{ __html: html }} />
  )
}
