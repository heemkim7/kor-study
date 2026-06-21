import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { Sparkles } from '../ui/Sparkles'
import { buildChoices } from './choices'
import { numberName, COUNT_EMOJI } from '../content/numbers'

const DIGIT_POOL = Array.from({ length: 10 }, (_, i) => String(i + 1))

/** 세어 보기 — 이모지를 세어(탭하며) 몇 개인지 숫자를 고른다. */
export function CountTap({ numbers, onCorrect, onWrong, onDone }: {
  numbers: number[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [counted, setCounted] = useState<number[]>([])
  const answer = numbers[round]
  const emoji = COUNT_EMOJI[round % COUNT_EMOJI.length]
  const choices = useMemo(() => buildChoices(String(answer), DIGIT_POOL, 3), [answer])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrong(null); setCounted([]) }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('몇 개일까요? 세어 보세요') }, [])

  function tapEmoji(i: number) {
    if (solved || counted.includes(i)) return
    const next = [...counted, i]
    setCounted(next)
    speak(numberName(next.length)) // 하나, 둘, 셋 … 세어 줌
  }

  function pick(d: string) {
    if (solved) return
    if (d === String(answer)) {
      setSolved(true)
      speak(numberName(answer))
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === numbers.length - 1) onDone()
        else setRound(round + 1)
      }, 1000)
    } else {
      speak('다시 세어 볼까?')
      onWrong?.()
      setWrong(d)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>몇 개일까요?</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 340,
        background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-card)' }}>
        {Array.from({ length: answer }, (_, i) => (
          <button key={i} onClick={() => tapEmoji(i)} className={counted.includes(i) ? 'kp-pop' : undefined}
            style={{ fontSize: 42, lineHeight: 1, border: 'none', background: 'transparent', padding: 8, minWidth: 58, minHeight: 58,
              opacity: counted.includes(i) ? 1 : 0.85, filter: counted.includes(i) ? 'drop-shadow(0 0 4px #ffd24d)' : 'none' }}>
            {emoji}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        {choices.map((d) => (
          <button key={d} onClick={() => pick(d)} className={wrong === d ? 'kp-shake' : undefined}
            style={{ width: 84, height: 84, borderRadius: 'var(--radius-lg)', border: 'none',
              fontFamily: 'var(--font-warm)', fontSize: 40, fontWeight: 800, color: 'var(--c-ink)',
              background: 'var(--c-card)', boxShadow: '0 5px 0 #f1ddc6' }}>
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
