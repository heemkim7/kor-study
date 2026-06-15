import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { ACHIEVEMENTS } from './achievements'

/** 뱃지·업적 — 기존 진행 신호로 달성 여부를 보여주는 갤러리. */
export function Badges() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const earned = ACHIEVEMENTS.filter((a) => a.done(progress)).length

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, marginTop: 4 }}>🏆 내 뱃지</h1>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        모은 뱃지 {earned} / {ACHIEVEMENTS.length}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 380, marginTop: 4 }}>
        {ACHIEVEMENTS.map((a) => {
          const done = a.done(progress)
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: 'var(--radius-lg)', background: done ? 'var(--c-card)' : '#efe7da',
              boxShadow: done ? 'var(--shadow-card)' : 'none', opacity: done ? 1 : 0.6 }}>
              <div style={{ fontSize: 34, flex: '0 0 auto', filter: done ? 'none' : 'grayscale(1)' }}>{done ? a.emoji : '🔒'}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>{a.name}</div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-soft)' }}>{a.desc}{done ? ' · 완료!' : ''}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
