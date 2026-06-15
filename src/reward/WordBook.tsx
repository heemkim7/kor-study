import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { WORDS } from '../content/words'
import { WordImage } from '../ui/WordImage'

/** 낱말 도감 — 배운 단어를 모으는 갤러리. 배운 단어만 그림이 켜지고, 누르면 발음. */
export function WordBook() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const learned = new Set(progress.learnedWords)

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, marginTop: 4 }}>📚 낱말 도감</h1>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        모은 단어 {learned.size} / {WORDS.length}
      </div>
      <p style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: -4 }}>놀이에서 배운 단어가 도감에 모여요!</p>

      {/* 단어가 많아(73개) 가로에선 열을 더 촘촘히 — 좌우를 채우고 세로 스크롤을 막음 */}
      <div style={{ display: 'grid', gridTemplateColumns: landscape ? 'repeat(auto-fill, minmax(74px, 1fr))' : 'repeat(3, 1fr)',
        gap: landscape ? 8 : 10, width: '100%', maxWidth: landscape ? 840 : 380, marginTop: 4 }}>
        {WORDS.map((w) => {
          const have = learned.has(w.id)
          return (
            <button key={w.id} disabled={!have} onClick={() => speak(w.text)}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, borderRadius: 'var(--radius-md)', border: 'none',
                background: have ? 'var(--c-card)' : '#efe7da', boxShadow: have ? 'var(--shadow-card)' : 'none',
                cursor: have ? 'pointer' : 'default' }}>
              {have ? (
                <>
                  <WordImage word={w} size={48} />
                  <span style={{ fontFamily: 'var(--font-warm)', fontSize: 14, fontWeight: 800, color: 'var(--c-ink)', letterSpacing: 1 }}>{w.text}</span>
                </>
              ) : (
                <span style={{ fontSize: 30, opacity: 0.35 }}>❓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
