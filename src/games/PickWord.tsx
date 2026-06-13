import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { Sparkles } from '../ui/Sparkles'
import { buildChoices } from './choices'

/** 그림을 보여주고 글자 보기 중 맞는 단어를 고르기 */
export function PickWord({ targetWords, pool, onCorrect, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  const choiceIds = useMemo(() => buildChoices(answerId, pool, 3), [answerId, pool])
  const choices = getWordsByIds(choiceIds)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false) }

  function pick(id: string) {
    if (solved) return
    if (id === answerId) {
      setSolved(true)
      speak(answer.text)
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === targetWords.length - 1) onDone()
        else setRound(round + 1)
      }, 900)
    } else {
      speak('다시 골라볼까?')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>이 그림은 무엇일까요?</h2>
      <div style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 18,
        boxShadow: 'var(--shadow-card)' }}>
        <WordImage word={answer} size={150} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {choices.map((w) => (
          <button key={w.id} onClick={() => pick(w.id)}
            style={{ fontFamily: 'var(--font-warm)', fontSize: 26, fontWeight: 800, letterSpacing: 3,
              color: 'var(--c-ink)', background: 'var(--c-card)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: '0 5px 0 #f1ddc6' }}>
            {w.text}
          </button>
        ))}
      </div>
    </div>
  )
}
