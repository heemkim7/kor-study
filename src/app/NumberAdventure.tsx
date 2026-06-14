import { useState } from 'react'
import { getNumberLesson } from '../content/numbers'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { NumberIntro } from '../games/NumberIntro'
import { CountTap } from '../games/CountTap'
import { Compare } from '../games/Compare'
import { RewardScreen } from '../reward/RewardScreen'
import { todayStr } from '../progress/progress'
import { playCorrect } from '../audio/sound'

type Phase = { kind: 'game'; index: number } | { kind: 'reward' }

export function NumberAdventure({ lessonId }: { lessonId: string }) {
  const lesson = getNumberLesson(lessonId)!
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  const [phase, setPhase] = useState<Phase>({ kind: 'game', index: 0 })
  const [awarded, setAwarded] = useState(true)

  const onCorrect = () => { playCorrect(); dispatch({ type: 'addStars', n: 1 }) }

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
      setAwarded(!progress.completedLessons.includes(lesson.id))
      dispatch({ type: 'completeLesson', lessonId: lesson.id })
      dispatch({ type: 'markPlayed', today: todayStr() })
      setPhase({ kind: 'reward' })
    }
  }

  function renderGame(index: number) {
    const g = lesson.games[index]
    const done = () => nextAfterGame(index)
    if (g === 'num-intro') return <NumberIntro numbers={lesson.numbers} onDone={done} />
    if (g === 'count-tap') return <CountTap numbers={lesson.numbers} onCorrect={onCorrect} onDone={done} />
    return <Compare numbers={lesson.numbers} onCorrect={onCorrect} onDone={done} />
  }

  const content = phase.kind === 'reward'
    ? <RewardScreen awarded={awarded} onHome={() => go({ name: 'home' })} />
    : renderGame(phase.index)

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {phase.kind !== 'reward' && (
        <button onClick={() => go({ name: 'home' })} aria-label="집으로"
          style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, zIndex: 10,
            width: 44, height: 44, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
            fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
          🏠
        </button>
      )}
      {content}
    </div>
  )
}
