import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { shuffle } from './choices'
import { ABC_WORD } from '../content/english'

// 보기(정답 글자 + 다른 글자 2개)를 만든다(Math.random은 컴포넌트 밖 모듈 함수로 분리 — 렌더 순수성).
function buildPhonicsChoices(answer: string, pool: string[]): string[] {
  const others = shuffle(pool.filter((l) => l !== answer)).slice(0, 2)
  return shuffle([answer, ...others])
}

/** 파닉스 — 글자의 첫소리에 맞는 그림 고르기 (A → Apple 🍎). 기존 ABC_WORD 재사용, 영어 음성. */
export function AbcPhonics({ letters, onCorrect, onWrong, onDone }: {
  letters: string[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const answer = letters[round]
  const pool = useMemo(() => Object.keys(ABC_WORD), [])
  const choiceLetters = useMemo(() => buildPhonicsChoices(answer, pool), [answer, pool])
  const answerWord = ABC_WORD[answer]

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrong(null) }

  // 글자 → 단어를 영어 음성으로 들려준다(A … Apple).
  const sayPhonics = (l: string) => {
    const w = ABC_WORD[l]
    speak(l, { lang: 'en-US', onEnd: () => speak(w.word, { lang: 'en-US' }) })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { sayPhonics(answer) }, [round])

  function pick(l: string) {
    if (solved) return
    if (l === answer) {
      setSolved(true)
      sayPhonics(answer)
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === letters.length - 1) onDone()
        else setRound(round + 1)
      }, 1100)
    } else {
      onWrong?.()
      setWrong(l)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>첫소리 그림을 찾아요</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
          fontFamily: 'var(--font-warm)', fontSize: 52, fontWeight: 800, color: '#3aa0d0' }}>{answer}</div>
        <SpeakerButton size={52} onClick={() => sayPhonics(answer)} />
      </div>
      <div style={{ fontSize: 16, color: 'var(--c-ink-soft)', fontWeight: 800 }}>{answer} … {answerWord.word}?</div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {choiceLetters.map((l) => (
          <button key={l} onClick={() => pick(l)} className={wrong === l ? 'kp-shake' : undefined}
            style={{ width: 116, height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
            <span style={{ fontSize: 56 }}>{ABC_WORD[l].emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
