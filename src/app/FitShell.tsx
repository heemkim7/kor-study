import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

// 디자인 기준 폭(모바일). 콘텐츠는 이 폭으로 그려진 뒤 화면에 맞게 비율 그대로 확대/축소된다.
const DESIGN_W = 430
const MAX_SCALE = 2.4

/**
 * 화면 어디서나(폰·태블릿·PC) 콘텐츠를 비율 그대로 확대/축소해
 * **스크롤 없이 한 화면에 딱 맞게 + 가운데 정렬**한다.
 * 콘텐츠의 실제 크기를 측정해 가로·세로 둘 다 맞는 배율을 적용(transform은 측정에 영향 없음).
 */
export function FitShell({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight
      const w = el.offsetWidth || DESIGN_W
      const h = el.offsetHeight
      if (!h) return
      setScale(Math.min(vw / w, vh / h, MAX_SCALE))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el) // 화면 전환으로 콘텐츠 높이가 바뀌면 다시 맞춤
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', overflow: 'hidden' }}>
      <div ref={innerRef} style={{ width: DESIGN_W, flex: '0 0 auto',
        transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {children}
      </div>
    </div>
  )
}
