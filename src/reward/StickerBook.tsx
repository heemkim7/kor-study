import { useEffect } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { STICKERS } from './stickers'
import { playSticker } from '../audio/sound'

export function StickerBook() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const collected = new Set(progress.collectedStickers)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('스티커 책이에요. 모은 스티커를 눌러 보세요') }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="집으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10,
          width: 44, height: 44, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)',
          fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
        🏠
      </button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, marginTop: 4 }}>🏅 스티커 책</h1>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        모은 스티커 {collected.size} / {STICKERS.length}
      </div>
      <p style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: -4 }}>
        놀이를 끝낼 때마다 새 스티커를 모아요!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${landscape ? 6 : 4}, 1fr)`, gap: 14,
        width: '100%', maxWidth: landscape ? 760 : 380, marginTop: 6 }}>
        {STICKERS.map((s) => {
          const have = collected.has(s.id)
          return (
            <button key={s.id} disabled={!have}
              onClick={() => { speak(s.name); playSticker() }}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 2, borderRadius: 'var(--radius-md)', border: 'none',
                background: have ? 'var(--c-card)' : '#efe7da',
                boxShadow: have ? 'var(--shadow-card)' : 'none',
                cursor: have ? 'pointer' : 'default' }}>
              <span style={{ fontSize: 30, filter: have ? 'none' : 'grayscale(1)', opacity: have ? 1 : 0.35 }}>
                {have ? s.emoji : '❓'}
              </span>
              {have && (
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)' }}>{s.name}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
