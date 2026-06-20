import { useEffect, useMemo, useRef, useState } from 'react'
import { useTts } from '../tts/useTts'
import { SpeakerButton } from '../ui/SpeakerButton'
import { Sparkles } from '../ui/Sparkles'
import { decomposeSyllable, composeSyllable } from '../hangul/decompose'
import { shuffle } from './choices'
import { BASIC_CONSONANTS, BASIC_VOWELS, BASIC_JONG, glyphSound } from '../content/letters'

type Slot = 'cho' | 'jung' | 'jong'

/** 글자 만들기 — 자음 + 모음 (+ 받침)을 골라 글자를 완성한다(한글 조합 원리). */
export function MakeSyllable({ glyphs, onCorrect, onWrong, onDone }: {
  glyphs: string[]; onCorrect: () => void; onWrong?: () => void; onDone: () => void
}) {
  const { speak } = useTts()
  const [round, setRound] = useState(0)
  const [cho, setCho] = useState<string | null>(null)
  const [jung, setJung] = useState<string | null>(null)
  const [jong, setJong] = useState<string | null>(null)
  const [solved, setSolved] = useState(false)
  const [shaking, setShaking] = useState(false)
  const target = glyphs[round]

  // 보기 타일(레슨별 고정): 목표 자모 + 약간의 방해. 받침이 필요한 레슨이면 받침 타일도.
  const { consTiles, vowTiles, jongTiles, needJong } = useMemo(() => {
    const decs = glyphs.map((g) => decomposeSyllable(g)).filter((d): d is NonNullable<typeof d> => !!d)
    const tChos = [...new Set(decs.map((d) => d.cho))]
    const tJungs = [...new Set(decs.map((d) => d.jung))]
    const tJongs = [...new Set(decs.map((d) => d.jong).filter((j) => j !== ''))]
    const fill = (targets: string[], pool: string[], max: number) =>
      shuffle([...targets, ...shuffle(pool.filter((x) => !targets.includes(x))).slice(0, Math.max(0, max - targets.length))])
    return {
      consTiles: fill(tChos, BASIC_CONSONANTS, 3),
      vowTiles: fill(tJungs, BASIC_VOWELS, 4),
      jongTiles: tJongs.length ? fill(tJongs, BASIC_JONG, 3) : [],
      needJong: tJongs.length > 0,
    }
  }, [glyphs])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shakeRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(shakeRef.current) }, [])

  // 라운드 바뀌면 초기화(렌더 중)
  const [prevRound, setPrevRound] = useState(round)
  if (round !== prevRound) { setPrevRound(round); setCho(null); setJung(null); setJong(null); setSolved(false); setShaking(false) }

  // 진입 안내(1회) → 첫 글자 들려줌
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('자음과 모음을 골라 글자를 만들어요', { onEnd: () => speak(target) }) }, [])
  // 라운드 바뀌면 목표 글자 들려줌
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (round > 0) speak(target) }, [round])

  function check(c: string, v: string, j: string) {
    if (composeSyllable(c, v, j) === target) {
      setSolved(true)
      speak(target)
      onCorrect()
      timerRef.current = setTimeout(() => {
        if (round === glyphs.length - 1) onDone()
        else setRound(round + 1)
      }, 1100)
    } else {
      speak('다시 해볼까?')
      onWrong?.()
      setShaking(true)
      clearTimeout(shakeRef.current)
      shakeRef.current = setTimeout(() => { setShaking(false); setCho(null); setJung(null); setJong(null) }, 480)
    }
  }

  function choose(kind: Slot, val: string) {
    if (solved || shaking) return
    const c = kind === 'cho' ? val : cho
    const v = kind === 'jung' ? val : jung
    const j = kind === 'jong' ? val : jong
    if (kind === 'cho') setCho(val)
    else if (kind === 'jung') setJung(val)
    else setJong(val)
    const ready = !!c && !!v && (!needJong || !!j)
    if (ready) check(c as string, v as string, needJong ? (j as string) : '')
    else if (kind === 'jung') speak(glyphSound(val)) // 모음을 누르면 소리(ㅏ→'아')
  }

  const preview = cho && jung && (!needJong || jong) ? (composeSyllable(cho, jung, needJong ? (jong as string) : '') ?? '') : ''

  const slot = (filled: string | null, label: string) => (
    <div style={{ width: 58, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 'var(--radius-md)', background: filled ? 'var(--c-card)' : '#fff',
      border: filled ? 'none' : '3px dashed #e3cba8', boxShadow: filled ? 'var(--shadow-card)' : 'none',
      fontFamily: 'var(--font-warm)', fontSize: 34, fontWeight: 800, color: 'var(--c-ink)' }}>
      {filled ?? <span style={{ fontSize: 12, color: '#c9bba8' }}>{label}</span>}
    </div>
  )

  const tileBtn = (val: string, kind: Slot, active: boolean) => (
    <button key={kind + val} onClick={() => choose(kind, val)} disabled={solved}
      style={{ width: 54, height: 54, borderRadius: 'var(--radius-md)', border: 'none',
        fontFamily: 'var(--font-warm)', fontSize: 30, fontWeight: 800,
        color: active ? '#fff' : 'var(--c-ink)', background: active ? 'var(--c-accent)' : 'var(--c-card)',
        boxShadow: '0 4px 0 #f1ddc6' }}>
      {val}
    </button>
  )

  const plus = <span style={{ fontSize: 22, color: 'var(--c-ink-soft)', fontWeight: 800 }}>+</span>

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14, padding: 24, position: 'relative' }}>
      {solved && <Sparkles />}
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 24 }}>글자를 만들어요</h2>

      {/* 목표 글자 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, color: 'var(--c-ink-soft)' }}>이 글자를 만들어요</span>
        <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
          fontFamily: 'var(--font-warm)', fontSize: 46, fontWeight: 800, color: 'var(--c-pink)' }}>{target}</div>
        <SpeakerButton size={46} onClick={() => speak(target)} />
      </div>

      {/* 조립 슬롯: 자음 + 모음 (+ 받침) = 글자 */}
      <div className={shaking ? 'kp-shake' : undefined} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {slot(cho, '자음')}
        {plus}
        {slot(jung, '모음')}
        {needJong && <>{plus}{slot(jong, '받침')}</>}
        <span style={{ fontSize: 22, color: 'var(--c-ink-soft)', fontWeight: 800 }}>=</span>
        <div style={{ width: 62, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-md)', background: solved ? 'var(--c-correct)' : '#fff',
          border: solved ? 'none' : '3px solid #f1ddc6',
          fontFamily: 'var(--font-warm)', fontSize: 40, fontWeight: 800, color: solved ? '#fff' : 'var(--c-ink)' }}>
          {preview}
        </div>
      </div>

      {/* 자음 타일 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
        {consTiles.map((c) => tileBtn(c, 'cho', cho === c))}
      </div>
      {/* 모음 타일 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {vowTiles.map((v) => tileBtn(v, 'jung', jung === v))}
      </div>
      {/* 받침 타일 */}
      {needJong && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--c-ink-soft)', fontWeight: 800, marginRight: 2 }}>받침</span>
          {jongTiles.map((j) => tileBtn(j, 'jong', jong === j))}
        </div>
      )}
    </div>
  )
}
