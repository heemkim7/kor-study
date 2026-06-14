import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { shuffle } from './choices'
import { glyphSound } from '../content/letters'

/** 소리를 듣고 같은 글자를 고른다(글자-소리 대응·음운 변별). */
export function FindLetter({ glyphs, onCorrect, onDone }: {
  glyphs: string[]; onCorrect: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const answer = glyphs[round]
  const choices = useMemo(() => shuffle(glyphs), [glyphs])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  // 라운드가 바뀌면 상태 초기화(렌더 중)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrong(null) }

  // 진입 안내(1회) → 첫 글자 소리
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('잘 듣고 같은 글자를 찾아요', { onEnd: () => speak(glyphSound(answer)) }) }, [])
  // 라운드가 바뀌면 정답 글자 소리(첫 라운드는 위 안내가 처리)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (round > 0) speak(glyphSound(answer)) }, [round])

  function pick(g: string) {
    if (solved) return
    if (g === answer) {
      setSolved(true)
      speak(glyphSound(answer))
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === glyphs.length - 1) onDone()
        else setRound(round + 1)
      }, 950)
    } else {
      speak('다시 들어볼까?')
      setWrong(g)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrong(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>잘 듣고 같은 글자를 찾아요</h2>
      <SpeakerButton size={56} onClick={() => speak(glyphSound(answer))} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {choices.map((g) => (
          <button key={g} onClick={() => pick(g)} className={wrong === g ? 'kp-shake' : undefined}
            style={{ width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-warm)', fontSize: 60, fontWeight: 800, color: 'var(--c-ink)',
              background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            {g}
          </button>
        ))}
      </div>
    </div>
  )
}
