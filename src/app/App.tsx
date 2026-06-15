import { useEffect } from 'react'
import { ProgressProvider } from '../progress/useProgress'
import { NavigationProvider, useNavigation } from './Navigation'
import { Home } from './Home'
import { SubjectScreen } from './SubjectScreen'
import { Adventure } from './Adventure'
import { LetterAdventure } from './LetterAdventure'
import { NumberAdventure } from './NumberAdventure'
import { AbcAdventure } from './AbcAdventure'
import { DressUp } from './DressUp'
import { StickerBook } from '../reward/StickerBook'
import { DrawBoard } from '../draw/DrawBoard'
import { ParentReport } from './ParentReport'
import { resumeAudio, startBgm } from '../audio/sound'

function Router() {
  const { screen } = useNavigation()
  if (screen.name === 'subject') return <SubjectScreen subject={screen.subject} />
  if (screen.name === 'adventure') return <Adventure lessonId={screen.lessonId} />
  if (screen.name === 'letter') return <LetterAdventure lessonId={screen.lessonId} />
  if (screen.name === 'number') return <NumberAdventure lessonId={screen.lessonId} />
  if (screen.name === 'abc') return <AbcAdventure lessonId={screen.lessonId} />
  if (screen.name === 'dressup') return <DressUp />
  if (screen.name === 'stickers') return <StickerBook />
  if (screen.name === 'draw') return <DrawBoard />
  if (screen.name === 'parent') return <ParentReport />
  return <Home />
}

export function App() {
  // 첫 사용자 제스처(탭/키) 때 오디오 컨텍스트를 깨우고 배경음악을 켠다(브라우저 자동재생 정책).
  useEffect(() => {
    const onGesture = () => { resumeAudio(); startBgm() }
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [])

  // 태블릿/큰 화면 대응: 모바일(~430px) 레이아웃을 비율 그대로 확대해 화면을 채운다.
  // 폰은 N=1(무변화). 가로·세로 둘 다 고려해 가로 모드에서 세로로 눌리지 않게 한다.
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const apply = () => {
      const n = Math.min(2.4, Math.max(1, Math.min(window.innerWidth / 430, window.innerHeight / 640)))
      if (n <= 1.001) {
        root.style.removeProperty('zoom')
        root.style.removeProperty('width')
        root.style.removeProperty('height')
      } else {
        const r = Math.round(n * 100) / 100
        root.style.setProperty('zoom', String(r))
        root.style.setProperty('width', `calc(100% / ${r})`)
        root.style.setProperty('height', `calc(100% / ${r})`)
      }
    }
    apply()
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])

  return (
    <ProgressProvider>
      <NavigationProvider>
        <Router />
      </NavigationProvider>
    </ProgressProvider>
  )
}
