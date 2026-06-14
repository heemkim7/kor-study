import { useEffect } from 'react'
import { useTts } from '../tts/useTts'
import { glyphSound } from '../content/letters'

/** 오늘의 글자 — 글자를 크게 보여주고 소리를 하나씩 들려준다. 탭하면 다시 들음. */
export function LetterIntro({ glyphs, onDone }: { glyphs: string[]; onDone: () => void }) {
  const { speak } = useTts()

  // 진입(1회): 안내 → 글자를 하나씩 읽어줌(연쇄)
  useEffect(() => {
    let i = 0
    const readNext = () => {
      if (i < glyphs.length) { const g = glyphs[i++]; speak(glyphSound(g), { onEnd: readNext }) }
    }
    speak('글자를 들어 보세요', { onEnd: readNext })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 18, padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 26 }}>오늘의 글자</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {glyphs.map((g) => (
          <button key={g} onClick={() => speak(glyphSound(g))}
            style={{ width: 104, height: 124, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, background: 'var(--c-card)', border: 'none',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            <span style={{ fontFamily: 'var(--font-warm)', fontSize: 64, fontWeight: 800, color: 'var(--c-ink)' }}>{g}</span>
            <span style={{ fontSize: 22 }}>🔊</span>
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
