import { useMemo, useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { WORDS } from '../content/words'
import { ListenFind } from '../games/ListenFind'
import { RewardScreen } from '../reward/RewardScreen'
import { shuffle } from '../games/choices'
import { playCorrect } from '../audio/sound'
import { todayStr } from '../progress/progress'

/** 복습 — 틀렸던 단어를 다시 듣고 찾는다. 맞히면 복습 큐에서 빠진다. */
export function ReviewSession() {
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  // 진입 시점의 복습 단어 일부(최대 5개)를 고정
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sample = useMemo(() => shuffle(progress.reviewWords).slice(0, 5), [])
  const pool = useMemo(() => WORDS.map((w) => w.id), [])
  const [done, setDone] = useState(false)

  const onCorrect = (id?: string) => {
    playCorrect()
    dispatch({ type: 'addStars', n: 1 })
    if (id) dispatch({ type: 'reviewMastered', id })
  }

  const home = (
    <button onClick={() => go({ name: 'home' })} aria-label="집으로"
      style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, zIndex: 10,
        width: 44, height: 44, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
        fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>
  )

  if (sample.length === 0 || done) {
    return <div style={{ position: 'relative', minHeight: '100%' }}>
      <RewardScreen awarded={false} onHome={() => go({ name: 'home' })} />
    </div>
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {home}
      <ListenFind targetWords={sample} pool={pool} onCorrect={onCorrect}
        onDone={() => { dispatch({ type: 'markPlayed', today: todayStr() }); setDone(true) }} choiceCount={3} />
    </div>
  )
}
