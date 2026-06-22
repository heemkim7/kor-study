import { useEffect } from 'react'
import { useTts } from '../tts/useTts'
import { numberName, COUNT_EMOJI } from '../content/numbers'

/** 오늘의 숫자 — 숫자·개수·이름을 함께 보여주고 하나씩 읽어 준다. */
export function NumberIntro({ numbers, onDone }: { numbers: number[]; onDone: () => void }) {
  const { speak } = useTts()

  useEffect(() => {
    let i = 0
    let cancelled = false
    const readNext = () => {
      if (cancelled || i >= numbers.length) return
      const n = numbers[i++]
      speak(numberName(n), { onEnd: readNext })
    }
    speak('숫자를 세어 보세요', { onEnd: readNext })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 26 }}>오늘의 숫자</h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {numbers.map((n, idx) => (
          <button key={n} onClick={() => speak(numberName(n))}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 14px',
              background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ fontFamily: 'var(--font-warm)', fontSize: 52, fontWeight: 800, color: 'var(--c-pink)' }}>{n}</span>
            <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center',
              maxWidth: 120, minHeight: 44, overflow: 'hidden', fontSize: 18, lineHeight: 1.2 }}>
              {Array.from({ length: n }, (_, k) => <span key={k}>{COUNT_EMOJI[idx % COUNT_EMOJI.length]}</span>)}
            </span>
            <span style={{ fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>{numberName(n)}</span>
          </button>
        ))}
      </div>
      <button onClick={onDone}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
        놀이하러 가기 ▶
      </button>
    </div>
  )
}
