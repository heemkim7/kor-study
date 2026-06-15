import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigation } from './Navigation'

// 디자인 기준 폭. 세로 화면(폰)은 좁은 컬럼. 가로 화면(태블릿·PC)에서는
// '허브형' 화면(홈·과목 선택)만 넓은 캔버스로 그려 콘텐츠를 좌우로 펼친다(좌우 여백 최소화).
// 게임처럼 한 가지에 집중하는 화면은 가로에서도 좁은 컬럼을 가운데에 두는 편이 보기 좋다.
const PORTRAIT_W = 430
const LANDSCAPE_W = 820
const MAX_SCALE = 2.6
// 종횡비가 이 값 이상이면 '가로'로 본다.
const LANDSCAPE_RATIO = 1.2
// 가로일 때 넓은 캔버스로 펼치는 화면(좌우 2단·다열 레이아웃을 가진 화면).
// 게임처럼 한 가지에 집중하는 화면은 제외(좁은 컬럼을 가운데에 두는 편이 보기 좋음).
const WIDE_SCREENS = new Set(['home', 'subject', 'dressup', 'stickers', 'wordbook', 'badges', 'parent'])

const computeLandscape = () => window.innerWidth / window.innerHeight >= LANDSCAPE_RATIO

type VP = { landscape: boolean }
const ViewportCtx = createContext<VP>({ landscape: false })
/** 현재 화면 방향(가로/세로). 화면들이 가로일 때 2단으로 펼치는 데 사용. */
// eslint-disable-next-line react-refresh/only-export-components
export const useViewport = () => useContext(ViewportCtx)

/**
 * 화면 어디서나(폰·태블릿·PC) 콘텐츠를 비율 그대로 확대/축소해
 * **스크롤 없이 한 화면에 딱 맞게 + 가운데 정렬**한다.
 * 가로 화면의 허브형 화면은 넓은 캔버스를 써서 콘텐츠가 가로로 펼쳐지도록 한다.
 * transform은 측정에 영향을 주지 않는다.
 */
export function FitShell({ children }: { children: ReactNode }) {
  const { screen } = useNavigation()
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [landscape, setLandscape] = useState(computeLandscape)

  const wide = landscape && WIDE_SCREENS.has(screen.name)
  const designW = wide ? LANDSCAPE_W : PORTRAIT_W

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const fit = () => {
      const vw = window.innerWidth, vh = window.innerHeight
      setLandscape(vw / vh >= LANDSCAPE_RATIO)
      const w = el.offsetWidth || PORTRAIT_W
      const h = el.offsetHeight
      if (!h) return
      setScale(Math.min(vw / w, vh / h, MAX_SCALE))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el) // 화면 전환·방향 전환으로 콘텐츠 크기가 바뀌면 다시 맞춤
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    window.addEventListener('load', fit) // 폰트/이미지 로드 뒤 한 번 더(초기 측정 작게 잡혀 스크롤 생기는 것 방지)
    const raf = requestAnimationFrame(fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
      window.removeEventListener('load', fit)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <ViewportCtx.Provider value={{ landscape }}>
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', overflow: 'hidden' }}>
        <div ref={innerRef} style={{ width: designW, flex: '0 0 auto',
          transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          {children}
        </div>
      </div>
    </ViewportCtx.Provider>
  )
}
