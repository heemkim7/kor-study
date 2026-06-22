import { useEffect, useRef, useState } from 'react'
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
  // 누르면 '톡' 튀는 시각 피드백(무음·저음량에서도 눌린 걸 알 수 있게)
  const [popId, setPopId] = useState<string | null>(null)
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(popTimer.current), [])
  function tap(id: string, name: string, have: boolean) {
    setPopId(id); clearTimeout(popTimer.current)
    popTimer.current = setTimeout(() => setPopId(null), 450)
    if (have) { speak(name); playSticker() } else speak('이 스티커는 놀이에서 모아요')
  }

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

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${landscape ? 78 : 74}px, 1fr))`, gap: 14,
        width: '100%', maxWidth: landscape ? 820 : 380, marginTop: 6 }}>
        {STICKERS.map((s) => {
          const have = collected.has(s.id)
          return (
            <button key={s.id} className={popId === s.id ? 'kp-pop' : undefined}
              aria-label={have ? s.name : '아직 못 모은 스티커'}
              onClick={() => tap(s.id, s.name, have)}
              style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 2, borderRadius: 'var(--radius-md)', border: 'none',
                background: have ? 'var(--c-card)' : '#efe7da',
                boxShadow: have ? 'var(--shadow-card)' : 'none',
                cursor: 'pointer' }}>
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
