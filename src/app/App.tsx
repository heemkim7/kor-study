import { useEffect } from 'react'
import { ProgressProvider } from '../progress/useProgress'
import { NavigationProvider, useNavigation } from './Navigation'
import { Home } from './Home'
import { Adventure } from './Adventure'
import { DressUp } from './DressUp'
import { StickerBook } from '../reward/StickerBook'
import { DrawBoard } from '../draw/DrawBoard'
import { resumeAudio, startBgm } from '../audio/sound'

function Router() {
  const { screen } = useNavigation()
  if (screen.name === 'adventure') return <Adventure lessonId={screen.lessonId} />
  if (screen.name === 'dressup') return <DressUp />
  if (screen.name === 'stickers') return <StickerBook />
  if (screen.name === 'draw') return <DrawBoard />
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

  return (
    <ProgressProvider>
      <NavigationProvider>
        <Router />
      </NavigationProvider>
    </ProgressProvider>
  )
}
