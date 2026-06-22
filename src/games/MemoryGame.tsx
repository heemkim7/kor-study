import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildMemoryDeck, isPair } from './memory'

/** 그림카드와 글자카드를 뒤집어 같은 단어끼리 짝을 맞춘다. */
export function MemoryGame({ targetWords, onCorrect, onWrong, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void; choiceCount?: number
}) {
  const { speak } = useTts()
  const deck = useMemo(() => buildMemoryDeck(targetWords), [targetWords])
  const [flipped, setFlipped] = useState<number[]>([]) // 현재 뒤집힌(미매칭) 카드 index
  const [matched, setMatched] = useState<string[]>([]) // 맞춘 wordId
  const [busy, setBusy] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 첫 진입에 놀이 방법 안내(1회)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('같은 짝을 맞춰보세요') }, [])

  function tap(idx: number) {
    if (busy) return
    const card = deck[idx]
    if (matched.includes(card.wordId) || flipped.includes(idx)) return

    if (flipped.length === 0) {
      setFlipped([idx])
      return
    }
    // 두 번째 카드
    const first = deck[flipped[0]]
    setFlipped([flipped[0], idx])
    setBusy(true)
    if (isPair(first, card)) {
      speak(getWord(card.wordId)!.text)
      onCorrect()
      setCelebrate(true)
      timerRef.current = setTimeout(() => {
        const nextMatched = [...matched, card.wordId]
        setCelebrate(false)
        if (nextMatched.length === targetWords.length) { onDone(); return }
        setMatched(nextMatched)
        setFlipped([])
        setBusy(false)
      }, 800)
    } else {
      onWrong?.() // 틀린 짝도 마스터리(정답률) 통계에 반영 — 다른 게임들과 일관
      timerRef.current = setTimeout(() => {
        setFlipped([])
        setBusy(false)
      }, 1100)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: '20px 16px', position: 'relative' }}>
      {celebrate && <Sparkles />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>같은 짝을 찾아요</h2>
        <SpeakerButton size={52} onClick={() => speak('같은 짝을 맞춰보세요')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, width: '100%', maxWidth: 340 }}>
        {deck.map((card, idx) => {
          const revealed = flipped.includes(idx) || matched.includes(card.wordId)
          const word = getWord(card.wordId)!
          return (
            <button key={card.cardId} onClick={() => tap(idx)} disabled={revealed}
              style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: revealed ? 'var(--c-card)' : 'var(--c-accent)',
                boxShadow: revealed ? 'var(--shadow-card)' : '0 5px 0 #d98a3a',
                fontFamily: 'var(--font-warm)', fontSize: 30, fontWeight: 800, color: 'var(--c-ink)',
                cursor: revealed ? 'default' : 'pointer', padding: 6 }}>
              {!revealed ? (
                <span style={{ fontSize: 40 }}>⭐</span>
              ) : card.kind === 'image' ? (
                <WordImage word={word} size={78} />
              ) : (
                <span style={{ fontSize: 44 }}>{word.text}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
