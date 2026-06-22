import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { toSyllables } from '../hangul/decompose'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildHuntGrid } from './huntGrid'

/** 큰 글자(단어의 첫 음절)를 보여주고, 격자에서 같은 글자를 모두 찾는다. */
export function LetterHunt({ targetWords, pool, onCorrect, onWrong, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onWrong?: (id?: string) => void; onDone: () => void; choiceCount?: number
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!
  const target = toSyllables(answer.text)[0]

  const distractorSyllables = useMemo(
    () => getWordsByIds(pool).flatMap((w) => toSyllables(w.text)),
    [pool],
  )
  const grid = useMemo(
    () => buildHuntGrid(target, distractorSyllables, 9, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerId, distractorSyllables],
  )
  const targetTotal = useMemo(() => grid.filter((c) => c === target).length, [grid, target])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setFound([]); setSolved(false); setWrongIdx(null) }

  // 진입 안내(1회): 놀이 방법 → 첫 글자
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('같은 글자를 모두 찾아요', { onEnd: () => speak(`${target} 글자를 찾아요`) }) }, [])
  // 라운드가 바뀌면 찾을 글자(첫 라운드는 위 안내가 처리)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (round > 0) speak(`${target} 글자를 찾아요`) }, [round])

  function tapCell(idx: number) {
    if (solved || found.includes(idx)) return
    if (grid[idx] === target) {
      const next = [...found, idx]
      setFound(next)
      speak(target)
      if (next.length === targetTotal) {
        setSolved(true)
        onCorrect()
        timerRef.current = setTimeout(() => {
          if (round === targetWords.length - 1) onDone()
          else setRound(round + 1)
        }, 1000)
      }
    } else {
      speak('다시 찾아볼까?')
      onWrong?.(answerId)
      setWrongIdx(idx)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrongIdx(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>같은 글자를 모두 찾아요</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 86, height: 86, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--c-pink)', color: '#fff', borderRadius: 'var(--radius-lg)',
          fontFamily: 'var(--font-warm)', fontSize: 48, fontWeight: 800, boxShadow: 'var(--shadow-card)' }}>
          {target}
        </div>
        <SpeakerButton size={52} onClick={() => speak(`${target} 글자를 찾아요`)} />
      </div>

      {/* 몇 개를 찾아야 하는지 점으로 — 끝을 알 수 있게(글 못 읽어도 직관적) */}
      <div style={{ display: 'flex', gap: 8 }} aria-label={`${found.length}/${targetTotal} 찾음`}>
        {Array.from({ length: targetTotal }).map((_, i) => (
          <span key={i} aria-hidden style={{ width: 16, height: 16, borderRadius: 999,
            background: i < found.length ? 'var(--c-correct)' : '#e7dcc9', transition: 'background .2s' }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 4, width: '100%', maxWidth: 330 }}>
        {grid.map((cell, idx) => {
          const hit = found.includes(idx)
          return (
            <button key={idx} onClick={() => tapCell(idx)} disabled={hit} className={wrongIdx === idx ? 'kp-shake' : undefined}
              style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', border: 'none',
                fontFamily: 'var(--font-warm)', fontSize: 38, fontWeight: 800,
                color: hit ? '#fff' : 'var(--c-ink)',
                background: hit ? 'var(--c-correct)' : 'var(--c-card)',
                boxShadow: hit ? 'var(--shadow-card)' : '0 5px 0 #f1ddc6',
                cursor: hit ? 'default' : 'pointer' }}>
              {cell}
            </button>
          )
        })}
      </div>
    </div>
  )
}
