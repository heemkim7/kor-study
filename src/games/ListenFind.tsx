import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildSmartChoices } from './choices'

/** targetWords 각각을 한 라운드씩 출제. 정답 시 onCorrect, 전부 끝나면 onDone */
export function ListenFind({ targetWords, pool, onCorrect, onDone, choiceCount = 3 }: {
  targetWords: string[]; pool: string[]; onCorrect: () => void; onDone: () => void; choiceCount?: number
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  // 그림 퀴즈: 같은 테마(비슷하게 생긴 그림)를 오답으로 우선 → 생뚱맞은 보기 방지
  const choiceIds = useMemo(
    () => buildSmartChoices(answerId, pool, choiceCount, [(id) => getWord(id)?.theme === answer.theme]),
    [answerId, pool, choiceCount, answer.theme],
  )
  const choices = getWordsByIds(choiceIds)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrongId(null) }

  // 진입 안내(1회): 놀이 방법 → 첫 단어
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('잘 듣고 같은 그림을 찾아요', { onEnd: () => speak(answer.text) }) }, [])
  // 라운드가 바뀌면 정답 단어(첫 라운드는 위 안내가 처리)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (round > 0) speak(answer.text) }, [round])

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
      setWrongId(id) // 소리 꺼져 있어도 '오답'을 흔들림으로 표시
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrongId(null), 450)
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
          <button key={w.id} onClick={() => pick(w.id)} className={wrongId === w.id ? 'kp-shake' : undefined}
            style={{ background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: 16, boxShadow: 'var(--shadow-card)' }}>
            <WordImage word={w} size={110} />
          </button>
        ))}
      </div>
    </div>
  )
}
