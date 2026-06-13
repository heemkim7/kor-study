import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { toSyllables } from '../hangul/decompose'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildSyllableTiles } from './wordTiles'

/** 그림을 보고, 섞인 음절 타일을 순서대로 눌러 단어를 완성한다. */
export function BuildWord({ targetWords, pool, onCorrect, onDone, choiceCount = 3 }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void; choiceCount?: number
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [placed, setPlaced] = useState<string[]>([])
  const [usedIdx, setUsedIdx] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  const distractorSyllables = useMemo(
    () => getWordsByIds(pool).flatMap((w) => toSyllables(w.text)),
    [pool],
  )
  const { answer: slots, tiles } = useMemo(
    () => buildSyllableTiles(answer.text, distractorSyllables, Math.max(1, choiceCount - 1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerId, distractorSyllables, choiceCount],
  )

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setPlaced([]); setUsedIdx([]); setSolved(false) }

  // 라운드마다 정답 음성 재생
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(answer.text) }, [round])

  function tapTile(idx: number) {
    if (solved || usedIdx.includes(idx)) return
    if (tiles[idx] === slots[placed.length]) {
      const next = [...placed, tiles[idx]]
      setPlaced(next)
      setUsedIdx([...usedIdx, idx])
      if (next.length === slots.length) {
        setSolved(true)
        speak(answer.text)
        onCorrect()
        timerRef.current = setTimeout(() => {
          if (round === targetWords.length - 1) onDone()
          else setRound(round + 1)
        }, 1100)
      }
    } else {
      speak('다시 해볼까?')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>글자를 만들어요</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 14,
          boxShadow: 'var(--shadow-card)' }}>
          <WordImage word={answer} size={120} />
        </div>
        <SpeakerButton size={52} onClick={() => speak(answer.text)} />
      </div>

      {/* 정답 슬롯 */}
      <div style={{ display: 'flex', gap: 10 }}>
        {slots.map((_, i) => (
          <div key={i} style={{ width: 64, height: 64, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: 'var(--radius-md)',
            background: placed[i] ? 'var(--c-correct)' : '#fff',
            border: placed[i] ? 'none' : '3px dashed #e3cba8',
            color: '#fff', fontFamily: 'var(--font-warm)', fontSize: 34, fontWeight: 800,
            boxShadow: placed[i] ? 'var(--shadow-card)' : 'none' }}>
            {placed[i] ?? ''}
          </div>
        ))}
      </div>

      {/* 음절 타일 */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
        {tiles.map((t, idx) => {
          const used = usedIdx.includes(idx)
          return (
            <button key={idx} onClick={() => tapTile(idx)} disabled={used}
              style={{ width: 66, height: 66, borderRadius: 'var(--radius-md)', border: 'none',
                fontFamily: 'var(--font-warm)', fontSize: 34, fontWeight: 800, color: 'var(--c-ink)',
                background: used ? '#f3e7d6' : 'var(--c-card)',
                opacity: used ? 0.35 : 1,
                boxShadow: used ? 'none' : '0 5px 0 #f1ddc6', cursor: used ? 'default' : 'pointer' }}>
              {used ? '' : t}
            </button>
          )
        })}
      </div>
    </div>
  )
}
