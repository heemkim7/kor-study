import { useState } from 'react'
import { getLetterLesson } from '../content/letters'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { LetterIntro } from '../games/LetterIntro'
import { MakeSyllable } from '../games/MakeSyllable'
import { FindLetter } from '../games/FindLetter'
import { Trace } from '../games/Trace'
import { RewardScreen } from '../reward/RewardScreen'
import { todayStr } from '../progress/progress'
import { playCorrect } from '../audio/sound'

type Phase = { kind: 'game'; index: number } | { kind: 'reward' }

export function LetterAdventure({ lessonId }: { lessonId: string }) {
  const lesson = getLetterLesson(lessonId)!
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
      dispatch({ type: 'logPlay', today: todayStr() })
      setPhase({ kind: 'reward' })
    }
  }

  function renderGame(index: number) {
    const g = lesson.games[index]
    const done = () => nextAfterGame(index)
    if (g === 'letter-intro') return <LetterIntro glyphs={lesson.glyphs} onDone={done} />
    if (g === 'make-syllable') return <MakeSyllable glyphs={lesson.glyphs} onCorrect={onCorrect} onDone={done} />
    if (g === 'trace') return <Trace glyphs={lesson.glyphs} onCorrect={onCorrect} onDone={done} />
    return <FindLetter glyphs={lesson.glyphs} onCorrect={onCorrect} onDone={done} />
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
