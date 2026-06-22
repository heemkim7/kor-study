import { useEffect, useMemo, useRef, useState } from 'react'
import { getWord, getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { useViewport } from '../app/FitShell'
import { WordImage } from '../ui/WordImage'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { buildSmartChoices } from './choices'

/** 그림을 보여주고 글자 보기 중 맞는 단어를 고르기 */
export function PickWord({ targetWords, pool, onCorrect, onDone, onWrong, choiceCount = 3 }: {
  targetWords: string[]; pool: string[]; onCorrect: (id?: string) => void; onDone: () => void
  onWrong?: (id: string) => void; choiceCount?: number
}) {
  const { speak } = useTts()
  const { landscape } = useViewport()
  const [round, setRound] = useState(0)
  const [solved, setSolved] = useState(false)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const answerId = targetWords[round]
  const answer = getWord(answerId)!

  // 단어 퀴즈: 같은 글자수(+가능하면 같은 테마)를 오답으로 우선 → 글자수가 같아 더 헷갈리고 덜 쉬움
  const choiceIds = useMemo(
    () => buildSmartChoices(answerId, pool, choiceCount, [
      (id) => { const w = getWord(id); return !!w && w.text.length === answer.text.length && w.theme === answer.theme },
      (id) => getWord(id)?.text.length === answer.text.length,
    ]),
    [answerId, pool, choiceCount, answer.text.length, answer.theme],
  )
  const choices = getWordsByIds(choiceIds)

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  // 첫 진입에 놀이 방법 안내(1회)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('그림을 보고 맞는 글자를 골라요') }, [])

  // 라운드가 바뀌면 상태 초기화(렌더 중 — 이펙트에서 setState 지양)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setSolved(false); setWrongId(null) }

  function pick(id: string) {
    if (solved) return
    if (id === answerId) {
      setSolved(true)
      speak(answer.text)
      onCorrect(answerId)
      timerRef.current = setTimeout(() => {
        if (round === targetWords.length - 1) onDone()
        else setRound(round + 1)
      }, 900)
    } else {
      speak('다시 골라볼까?')
      onWrong?.(answerId)
      setWrongId(id) // 소리 꺼져 있어도 '오답'을 흔들림으로 표시
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => setWrongId(null), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>이 그림은 무엇일까요?</h2>
      <div style={{ position: 'relative', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 18,
        boxShadow: 'var(--shadow-card)' }}>
        <WordImage word={answer} size={150} />
        {/* 그림을 알아도 보기(글자)를 못 읽는 아이가 정답 단어를 다시 들을 수 있게 */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <SpeakerButton size={48} onClick={() => speak(answer.text)} />
        </div>
      </div>
      {/* 가로 화면에서는 보기를 한 줄로 펼쳐 좌우를 채움(세로 화면은 큰 버튼을 위아래로) */}
      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', flexWrap: 'wrap',
        gap: 12, width: '100%', maxWidth: landscape ? 430 : 320, justifyContent: 'center' }}>
        {choices.map((w) => (
          <button key={w.id} onClick={() => pick(w.id)} className={wrongId === w.id ? 'kp-shake' : undefined}
            style={{ fontFamily: 'var(--font-warm)', fontSize: 26, fontWeight: 800, letterSpacing: 3,
              color: 'var(--c-ink)', background: 'var(--c-card)', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '16px 22px', boxShadow: '0 5px 0 #f1ddc6' }}>
            {w.text}
          </button>
        ))}
      </div>
    </div>
  )
}
