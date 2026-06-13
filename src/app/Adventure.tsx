import { useMemo, useState } from 'react'
import { getLesson } from '../content/loader'
import { WORDS } from '../content/words'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { StoryPlayer } from '../story/StoryPlayer'
import { TodayWords } from '../story/TodayWords'
import { ListenFind } from '../games/ListenFind'
import { PickWord } from '../games/PickWord'
import { RewardScreen } from '../reward/RewardScreen'

type Phase = { kind: 'story' } | { kind: 'words' } | { kind: 'game'; index: number } | { kind: 'reward' }

export function Adventure({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!
  const { dispatch } = useProgress()
  const { go } = useNavigation()
  const [phase, setPhase] = useState<Phase>({ kind: 'story' })

  const pool = useMemo(() => WORDS.map((w) => w.id), [])
  const onCorrect = () => dispatch({ type: 'addStars', n: 1 })

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
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
    // M1에서 미구현 게임은 안내 후 수동 진행 (fruit-1 정상 흐름에선 도달하지 않음 — 렌더 중 setState 방지)
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>이 놀이는 다음 버전에서 추가돼요.</p>
        <button onClick={() => nextAfterGame(phase.index)}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 26px', boxShadow: '0 5px 0 #d98a3a' }}>다음 ▶</button>
      </div>
    )
  }

  return <RewardScreen onHome={() => go({ name: 'home' })} />
}
