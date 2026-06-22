import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { shuffle } from './choices'
import { abcSay } from '../content/english'

/** 소리를 듣고 같은 알파벳을 고른다(영어 음성). */
export function AbcFind({ letters, onCorrect, onWrong, onDone }: {
  letters: string[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const answer = letters[round]
  // 라운드마다 타일 배치를 다시 섞어 '자리만 외워 통과'를 막는다(소리로 변별하게).
  // round를 의존성에 둬 라운드 전환 시 재셔플(콜백이 round를 직접 안 써 lint가 불필요하다고 보지만 의도된 것).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => shuffle(letters), [letters, round])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrong(null) }

  const sayLetter = (l: string) => { const s = abcSay(l); speak(s.text, { lang: s.lang }) }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { sayLetter(answer) }, [round])

  function pick(l: string) {
    if (solved) return
    if (l === answer) {
      setSolved(true)
      sayLetter(answer)
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === letters.length - 1) onDone()
        else setRound(round + 1)
      }, 950)
    } else {
      onWrong?.()
      setWrong(l)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>잘 듣고 같은 글자를 찾아요</h2>
      <SpeakerButton size={56} onClick={() => sayLetter(answer)} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {choices.map((l) => (
          <button key={l} onClick={() => pick(l)} className={wrong === l ? 'kp-shake' : undefined}
            style={{ width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-warm)', fontSize: 48, fontWeight: 800, color: '#3aa0d0',
              background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
