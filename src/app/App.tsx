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
import { WordBook } from '../reward/WordBook'
import { Badges } from '../reward/Badges'
import { ReviewSession } from './ReviewSession'
import { ParentReport } from './ParentReport'
import { FitShell } from './FitShell'
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
  if (screen.name === 'wordbook') return <WordBook />
  if (screen.name === 'badges') return <Badges />
  if (screen.name === 'review') return <ReviewSession />
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

  return (
    <ProgressProvider>
      <NavigationProvider>
        <FitShell>
          <Router />
        </FitShell>
      </NavigationProvider>
    </ProgressProvider>
  )
}
