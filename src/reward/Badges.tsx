import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { playSticker } from '../audio/sound'
import { ACHIEVEMENTS } from './achievements'

/** 뱃지·업적 — 기존 진행 신호로 달성 여부를 보여주는 갤러리. */
export function Badges() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const earned = ACHIEVEMENTS.filter((a) => a.done(progress)).length
  // 아이가 큰 그림을 누르면 무반응이 아니라 음성·소리·'톡' 피드백을 준다.
  const [popId, setPopId] = useState<string | null>(null)
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(popTimer.current), [])
  function tap(id: string, name: string, desc: string, done: boolean) {
    setPopId(id); clearTimeout(popTimer.current)
    popTimer.current = setTimeout(() => setPopId(null), 450)
    if (done) { speak(`${name}. 완료!`); playSticker() } else speak(desc)
  }

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

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${landscape ? 2 : 1}, 1fr)`, gap: 10,
        width: '100%', maxWidth: landscape ? 780 : 380, marginTop: 4 }}>
        {ACHIEVEMENTS.map((a) => {
          const done = a.done(progress)
          return (
            <button key={a.id} className={popId === a.id ? 'kp-pop' : undefined}
              aria-label={done ? `${a.name} 완료` : `${a.name} 아직`}
              onClick={() => tap(a.id, a.name, a.desc, done)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', textAlign: 'left',
              border: 'none', cursor: 'pointer', width: '100%',
              borderRadius: 'var(--radius-lg)', background: done ? 'var(--c-card)' : '#efe7da',
              boxShadow: done ? 'var(--shadow-card)' : 'none', opacity: done ? 1 : 0.6 }}>
              <div style={{ fontSize: 34, flex: '0 0 auto', filter: done ? 'none' : 'grayscale(1)' }}>{done ? a.emoji : '🔒'}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: 'var(--c-ink)' }}>{a.name}</div>
                <div style={{ fontSize: 13, color: 'var(--c-ink-soft)' }}>{a.desc}{done ? ' · 완료!' : ''}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
