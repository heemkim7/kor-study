import { useEffect } from 'react'
import { useTts } from '../tts/useTts'
import { ABC_WORD, abcSay } from '../content/english'

/** 오늘의 알파벳 — 대/소문자 + 예시 단어(이모지)를 보여주고 영어 음성으로 읽어 준다. */
export function AbcIntro({ letters, onDone }: { letters: string[]; onDone: () => void }) {
  const { speak } = useTts()

  useEffect(() => {
    let i = 0
    let cancelled = false
    const readNext = () => {
      if (cancelled || i >= letters.length) return
      const s = abcSay(letters[i++])
      speak(s.text, { lang: s.lang, onEnd: readNext })
    }
    readNext()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 16, padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 26 }}>오늘의 알파벳</h2>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {letters.map((L) => {
          const w = ABC_WORD[L]
          return (
            <button key={L} onClick={() => { const s = abcSay(L); speak(s.text, { lang: s.lang }) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '12px 16px',
                background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ fontFamily: 'var(--font-warm)', fontSize: 44, fontWeight: 800, color: '#3aa0d0' }}>{L} {L.toLowerCase()}</span>
              <span style={{ fontSize: 30 }}>{w?.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-ink-soft)' }}>{w?.word}</span>
            </button>
          )
        })}
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
