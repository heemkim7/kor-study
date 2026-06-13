import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildChoices } from './choices'

/** targetWords 각각을 한 라운드씩 출제. 정답 시 onCorrect, 전부 끝나면 onDone */
export function ListenFind({ targetWords, pool, onCorrect, onDone }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  const choiceIds = useMemo(
    () => buildChoices(answerId, pool, 3),
    [answerId, pool],
  )
  const choices = getWordsByIds(choiceIds)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false) }

  // 라운드마다 정답 음성 재생(부수효과는 이펙트에서)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(answer.text) }, [round])

  function pick(id: string) {
    if (solved) return
    if (id === answerId) {
      setSolved(true)
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === targetWords.length - 1) onDone()
        else setRound(round + 1)
      }, 900)
    } else {
      speak('다시 들어볼까?')
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 20, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>잘 듣고 그림을 찾아요</h2>
      <SpeakerButton size={56} onClick={() => speak(answer.text)} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {choices.map((w) => (
          <button key={w.id} onClick={() => pick(w.id)}
            style={{ background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: 16, boxShadow: 'var(--shadow-card)' }}>
            <WordImage word={w} size={110} />
          </button>
        ))}
      </div>
    </div>
  )
}
