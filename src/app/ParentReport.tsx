import { useMemo, useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { allLessons, getWord } from '../content/loader'
import { LETTER_LESSONS } from '../content/letters'
import { NUMBER_LESSONS } from '../content/numbers'
import { ABC_LESSONS } from '../content/english'
import { STICKERS } from '../reward/stickers'

// 6~9 곱셈 문제(모듈 함수 — 렌더 중 직접 난수 호출 회피)
function genGateProblem(): { a: number; b: number } {
  return { a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }
}

/** 보호자 확인(곱셈 게이트) — 4세가 못 풀게 막고, 통과 시 학습 리포트를 보여준다. */
function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [problem, setProblem] = useState(genGateProblem)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  function press(d: string) {
    setWrong(false)
    setInput((s) => (s.length < 3 ? s + d : s))
  }
  function submit() {
    if (Number(input) === problem.a * problem.b) onPass()
    else { setWrong(true); setInput(''); setProblem(genGateProblem()) } // 오답 시 새 문제 → 무차별 대입 차단
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 22 }}>보호자 확인</h2>
      <p style={{ color: 'var(--c-ink-soft)', fontSize: 14, marginTop: -8 }}>아래 곱셈을 풀어 주세요</p>
      <div className={wrong ? 'kp-shake' : undefined}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 36, fontWeight: 800, color: 'var(--c-ink)' }}>
        {problem.a} × {problem.b} = {input || '?'}
      </div>
      {wrong && <div style={{ color: 'var(--c-pink)', fontWeight: 800, fontSize: 14 }}>다시 입력해 주세요</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 8 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} onClick={() => press(d)}
            style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none', fontSize: 24, fontWeight: 800,
              background: 'var(--c-card)', boxShadow: '0 4px 0 #f1ddc6' }}>{d}</button>
        ))}
        <button onClick={() => setInput('')} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 16, fontWeight: 800, background: '#f3e7d6' }}>지움</button>
        <button onClick={() => press('0')} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 24, fontWeight: 800, background: 'var(--c-card)', boxShadow: '0 4px 0 #f1ddc6' }}>0</button>
        <button onClick={submit} style={{ height: 56, borderRadius: 'var(--radius-md)', border: 'none',
          fontSize: 18, fontWeight: 800, color: '#fff', background: 'var(--c-accent)' }}>확인</button>
      </div>
      <button onClick={onCancel} style={{ marginTop: 6, background: 'none', border: 'none',
        color: 'var(--c-ink-soft)', fontSize: 14, textDecoration: 'underline' }}>돌아가기</button>
    </div>
  )
}

export function ParentReport() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const [passed, setPassed] = useState(false)

  const stats = useMemo(() => {
    const done = new Set(progress.completedLessons)
    const wordIds = new Set(allLessons().map((l) => l.id))
    const letterIds = new Set(LETTER_LESSONS.map((l) => l.id))
    const numberIds = new Set(NUMBER_LESSONS.map((l) => l.id))
    const abcIds = new Set(ABC_LESSONS.map((l) => l.id))
    const countIn = (ids: Set<string>) => progress.completedLessons.filter((id) => ids.has(id)).length
    return {
      words: countIn(wordIds), letters: countIn(letterIds), numbers: countIn(numberIds), english: countIn(abcIds),
      totalLessons: done.size,
      learnedWordTexts: progress.learnedWords.map((id) => getWord(id)?.text).filter(Boolean) as string[],
    }
  }, [progress])

  if (!passed) return <ParentGate onPass={() => setPassed(true)} onCancel={() => go({ name: 'home' })} />

  const card = (emoji: string, label: string, value: string | number, bg: string) => (
    <div style={{ flex: '1 1 44%', minWidth: 130, display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: bg, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: 'var(--c-ink)' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>{label}</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="집으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10,
          width: 44, height: 44, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
          fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 4 }}>📊 학습 리포트</h1>
      <p style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: -6 }}>우리 아이가 지금까지 배운 내용이에요</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%', maxWidth: 380 }}>
        {card('🔥', '연속 출석', `${progress.streak}일`, 'linear-gradient(135deg,#fff3d6,#fffaf0)')}
        {card('⭐', '모은 별', progress.stars, 'linear-gradient(135deg,#fff7e0,#fffdf4)')}
        {card('📖', '배운 글자 놀이', `${stats.letters}개`, 'linear-gradient(135deg,#efe6ff,#f9f5ff)')}
        {card('🔤', '배운 영어 놀이', `${stats.english}개`, 'linear-gradient(135deg,#e6f1ff,#f5faff)')}
        {card('🔢', '배운 숫자 놀이', `${stats.numbers}개`, 'linear-gradient(135deg,#e3f7ec,#f3fff8)')}
        {card('🍓', '배운 단어 놀이', `${stats.words}개`, 'linear-gradient(135deg,#ffe9ef,#fff5f8)')}
        {card('🏅', '모은 스티커', `${progress.collectedStickers.length}/${STICKERS.length}`, 'linear-gradient(135deg,#e8f0ff,#f5f9ff)')}
      </div>

      <div style={{ width: '100%', maxWidth: 380, background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
        padding: 16, boxShadow: 'var(--shadow-card)', marginTop: 4 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
          배운 단어 ({stats.learnedWordTexts.length})
        </div>
        {stats.learnedWordTexts.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)' }}>아직 없어요. 놀이를 시작해 보세요!</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {stats.learnedWordTexts.map((t, i) => (
              <span key={i} style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', background: '#fbeef5',
                padding: '4px 10px', borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
