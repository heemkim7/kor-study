import { useMemo, useState } from 'react'
import { getLesson } from '../content/loader'
import { WORDS } from '../content/words'
import { choiceCountForLevel } from '../content/difficulty'
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
import { todayStr } from '../progress/progress'
import { playCorrect } from '../audio/sound'

type Phase = { kind: 'story' } | { kind: 'words' } | { kind: 'game'; index: number } | { kind: 'reward' }

export function Adventure({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId)!
  const { progress, dispatch } = useProgress()
  const { go } = useNavigation()
  // 스토리가 있으면 그림책부터, 없으면(연습 레슨) 바로 오늘의 단어로
  const [phase, setPhase] = useState<Phase>(lesson.story.length ? { kind: 'story' } : { kind: 'words' })
  const [awarded, setAwarded] = useState(true)

  const pool = useMemo(() => WORDS.map((w) => w.id), [])
  // 정답: 별 +1 + 칭찬음, 맞힌 단어는 복습 큐에서 빼줌. 오답: 복습 큐에 등록.
  const onCorrect = (id?: string) => { playCorrect(); dispatch({ type: 'addStars', n: 1 }); if (id) dispatch({ type: 'reviewMastered', id }) }
  const onWrong = (id: string) => dispatch({ type: 'reviewWrong', id })

  function nextAfterGame(index: number) {
    if (index < lesson.games.length - 1) setPhase({ kind: 'game', index: index + 1 })
    else {
      // 처음 완료할 때만 스티커가 지급됨(completeLesson은 멱등) → 보상 화면 문구를 맞춤
      setAwarded(!progress.completedLessons.includes(lesson.id))
      dispatch({ type: 'learnWords', ids: lesson.targetWords })
      dispatch({ type: 'completeLesson', lessonId: lesson.id })
      dispatch({ type: 'markPlayed', today: todayStr() })
      dispatch({ type: 'logPlay', today: todayStr() })
      setPhase({ kind: 'reward' })
    }
  }

  function renderGame(index: number) {
    const gameId = lesson.games[index]
    const common = {
      targetWords: lesson.targetWords, pool, onCorrect,
      onDone: () => nextAfterGame(index),
      choiceCount: choiceCountForLevel(lesson.level),
    }
    if (gameId === 'listen-find') return <ListenFind {...common} onWrong={onWrong} />
    if (gameId === 'pick-word') return <PickWord {...common} onWrong={onWrong} />
    if (gameId === 'build-word') return <BuildWord {...common} />
    if (gameId === 'letter-hunt') return <LetterHunt {...common} />
    if (gameId === 'memory') return <MemoryGame {...common} />
    // 알 수 없는 게임 id는 건너뜀 (렌더 중 setState 방지 — 버튼으로 진행)
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>다음 놀이로 넘어가요.</p>
        <button onClick={() => nextAfterGame(index)}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 26px', boxShadow: '0 5px 0 #d98a3a' }}>다음 ▶</button>
      </div>
    )
  }

  let content
  if (phase.kind === 'story') content = <StoryPlayer lesson={lesson} onDone={() => setPhase({ kind: 'words' })} />
  else if (phase.kind === 'words') content = <TodayWords lesson={lesson} onDone={() => setPhase({ kind: 'game', index: 0 })} />
  else if (phase.kind === 'game') content = renderGame(phase.index)
  else content = <RewardScreen awarded={awarded} onHome={() => go({ name: 'home' })} />

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {phase.kind !== 'reward' && (
        // 어느 단계에서나 집으로 나갈 수 있는 탈출 경로(보상화면은 자체 버튼 보유)
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
