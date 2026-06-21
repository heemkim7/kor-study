import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { Sparkles } from '../ui/Sparkles'
import { COUNT_EMOJI } from '../content/numbers'

const ROUNDS = 3

// 라운드별 (왼쪽, 오른쪽) 수 쌍을 만든다(서로 다르게). 모듈 함수로 두어 렌더 중 직접 난수 호출을 피함.
function makeComparePairs(numbers: number[], rounds: number): Array<[number, number]> {
  const maxN = Math.max(...numbers, 5)
  const rand = () => 1 + Math.floor(Math.random() * maxN)
  const out: Array<[number, number]> = []
  for (let r = 0; r < rounds; r++) {
    const a = rand()
    let b = rand()
    while (b === a) b = rand()
    out.push([a, b])
  }
  return out
}

/** 수량 비교 — 어느 쪽이 더 많은지 고른다(많고 적음 개념). */
export function Compare({ numbers, onCorrect, onWrong, onDone }: {
  numbers: number[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrong, setWrong] = useState<number | null>(null)

  // 라운드별 (왼쪽 수, 오른쪽 수) — 서로 다르게. 마운트 시 1회 생성.
  const pairs = useMemo(() => makeComparePairs(numbers, ROUNDS), [numbers])

  const [left, right] = pairs[round]
  const moreSide = left > right ? 0 : 1

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrong(null) }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('어느 쪽이 더 많을까요?') }, [])

  function pick(side: number) {
    if (solved) return
    if (side === moreSide) {
      setSolved(true)
      speak('많아요!')
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === ROUNDS - 1) onDone()
        else setRound(round + 1)
      }, 1000)
    } else {
      speak('다시 볼까?')
      onWrong?.()
      setWrong(side)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrong(null), 450)
    }
  }

  const panel = (side: number, count: number, emoji: string) => (
    <button onClick={() => pick(side)} className={wrong === side ? 'kp-shake' : undefined}
      style={{ flex: 1, minHeight: 220, display: 'flex', flexWrap: 'wrap', gap: 10, alignContent: 'center',
        justifyContent: 'center', padding: 14, border: solved && side === moreSide ? '4px solid var(--c-correct)' : 'none',
        borderRadius: 'var(--radius-lg)', background: 'var(--c-card)', boxShadow: 'var(--shadow-card)' }}>
      {Array.from({ length: count }, (_, k) => <span key={k} style={{ fontSize: 34, lineHeight: 1 }}>{emoji}</span>)}
    </button>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>어느 쪽이 더 많을까요?</h2>
      <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 380, flex: 1, alignItems: 'center' }}>
        {panel(0, left, COUNT_EMOJI[(round * 2) % COUNT_EMOJI.length])}
        {panel(1, right, COUNT_EMOJI[(round * 2 + 1) % COUNT_EMOJI.length])}
      </div>
    </div>
  )
}
