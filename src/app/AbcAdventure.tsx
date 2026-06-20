import { useRef, useState } from 'react'
import { getAbcLesson, abcSay } from '../content/english'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { AbcIntro } from '../games/AbcIntro'
import { AbcFind } from '../games/AbcFind'
import { AbcPhonics } from '../games/AbcPhonics'
import { Trace } from '../games/Trace'
import { RewardScreen } from '../reward/RewardScreen'
import { todayStr, masteryStars } from '../progress/progress'
import { playCorrect } from '../audio/sound'

type Phase = { kind: 'game'; index: number } | { kind: 'reward' }

export function AbcAdventure({ lessonId }: { lessonId: string }) {
  const lesson = getAbcLesson(lessonId)!
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  const [phase, setPhase] = useState<Phase>({ kind: 'game', index: 0 })
  const [awarded, setAwarded] = useState(true)
  const [earned, setEarned] = useState<number | undefined>(undefined)
  const wrongRef = useRef(0)

  const onCorrect = () => { playCorrect(); dispatch({ type: 'addStars', n: 1 }) }
  const onWrong = () => { wrongRef.current++ }

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
      setAwarded(!progress.completedLessons.includes(lesson.id))
      const m = masteryStars(wrongRef.current)
      setEarned(m)
      dispatch({ type: 'completeLesson', lessonId: lesson.id })
      dispatch({ type: 'setLessonStars', lessonId: lesson.id, stars: m })
      dispatch({ type: 'markPlayed', today: todayStr() })
      dispatch({ type: 'logPlay', today: todayStr() })
      setPhase({ kind: 'reward' })
    }
  }

  function renderGame(index: number) {
    const g = lesson.games[index]
    const done = () => nextAfterGame(index)
    if (g === 'abc-intro') return <AbcIntro letters={lesson.letters} onDone={done} />
    if (g === 'abc-find') return <AbcFind letters={lesson.letters} onCorrect={onCorrect} onWrong={onWrong} onDone={done} />
    if (g === 'abc-phonics') return <AbcPhonics letters={lesson.letters} onCorrect={onCorrect} onWrong={onWrong} onDone={done} />
    return <Trace glyphs={lesson.letters} say={abcSay} onCorrect={onCorrect} onDone={done} />
  }

  const content = phase.kind === 'reward'
    ? <RewardScreen awarded={awarded} stars={earned} onHome={() => go({ name: 'home' })} />
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
