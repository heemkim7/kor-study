import { useEffect, useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'

/** 우리 가족 — 부모가 넣은 이름·가족 단어를 아이가 보고 읽는다(통글자 읽기·개인화).
 *  커스텀 단어라 미리 만든 음성이 없어 브라우저 한국어 음성으로 읽어 준다. */
export function FamilyRead() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const words = progress.familyWords
  const [active, setActive] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (words.length) speak('우리 가족을 읽어 봐요') }, [])

  function tap(w: string) {
    setActive(w)
    speak(w)
    window.setTimeout(() => setActive((cur) => (cur === w ? null : cur)), 700)
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 4 }}>👨‍👩‍👧 우리 가족</h1>

      {words.length === 0 ? (
        <div style={{ maxWidth: 360, textAlign: 'center', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
          padding: 24, boxShadow: 'var(--shadow-card)', marginTop: 20 }}>
          <div style={{ fontSize: 56 }}>💛</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, marginTop: 8 }}>아직 비어 있어요</div>
          <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 6, lineHeight: 1.5 }}>
            보호자 화면에서 아이 이름과 가족 이름(엄마·아빠 등)을 넣어 주세요. 그러면 여기서 읽기 놀이를 할 수 있어요!
          </div>
          <button onClick={() => go({ name: 'parent' })}
            style={{ marginTop: 16, border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 22px', minHeight: 46,
              fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: '#fff', background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a' }}>
            📊 보호자 화면으로
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: -4 }}>눌러서 읽어 봐요!</p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${landscape ? 4 : 2}, 1fr)`, gap: 12,
            width: '100%', maxWidth: landscape ? 720 : 380 }}>
            {words.map((w) => (
              <button key={w} onClick={() => tap(w)} className={active === w ? 'kp-pop' : undefined}
                style={{ minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px',
                  borderRadius: 'var(--radius-lg)', border: active === w ? '3px solid var(--c-pink)' : 'none',
                  background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer',
                  fontFamily: 'var(--font-warm)', fontSize: 30, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: 2 }}>
                {w}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
