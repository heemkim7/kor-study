import { useMemo, useState } from 'react'
import { getLesson } from '../content/loader'
import { WORDS } from '../content/words'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { StoryPlayer } from '../story/StoryPlayer'
import { TodayWords } from '../story/TodayWords'
import { ListenFind } from '../games/ListenFind'
import { PickWord } from '../games/PickWord'
import { BuildWord } from '../games/BuildWord'
import { LetterHunt } from '../games/LetterHunt'
import { MemoryGame } from '../games/MemoryGame'
import { RewardScreen } from '../reward/RewardScreen'

type Phase = { kind: 'story' } | { kind: 'words' } | { kind: 'game'; index: number } | { kind: 'reward' }

export function Adventure({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  const [phase, setPhase] = useState<Phase>({ kind: 'story' })
  const [awarded, setAwarded] = useState(true)

  const pool = useMemo(() => WORDS.map((w) => w.id), [])
  const onCorrect = () => dispatch({ type: 'addStars', n: 1 })

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
      // 처음 완료할 때만 스티커가 지급됨(completeLesson은 멱등) → 보상 화면 문구를 맞춤
      setAwarded(!progress.completedLessons.includes(lesson.id))
      dispatch({ type: 'learnWords', ids: lesson.targetWords })
      dispatch({ type: 'completeLesson', lessonId: lesson.id })
      setPhase({ kind: 'reward' })
    }
  }

  if (phase.kind === 'story')
    return <StoryPlayer lesson={lesson} onDone={() => setPhase({ kind: 'words' })} />

  if (phase.kind === 'words')
    return <TodayWords lesson={lesson} onDone={() => setPhase({ kind: 'game', index: 0 })} />

  if (phase.kind === 'game') {
    const gameId = lesson.games[phase.index]
    const common = {
      targetWords: lesson.targetWords, pool, onCorrect,
      onDone: () => nextAfterGame(phase.index),
    }
    if (gameId === 'listen-find') return <ListenFind {...common} />
    if (gameId === 'pick-word') return <PickWord {...common} />
    if (gameId === 'build-word') return <BuildWord {...common} />
    if (gameId === 'letter-hunt') return <LetterHunt {...common} />
    if (gameId === 'memory') return <MemoryGame {...common} />
    // 알 수 없는 게임 id는 건너뜀 (렌더 중 setState 방지 — 버튼으로 진행)
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>다음 놀이로 넘어가요.</p>
        <button onClick={() => nextAfterGame(phase.index)}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 26px', boxShadow: '0 5px 0 #d98a3a' }}>다음 ▶</button>
      </div>
    )
  }

  return <RewardScreen awarded={awarded} onHome={() => go({ name: 'home' })} />
}
