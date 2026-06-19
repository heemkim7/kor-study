import { useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { Sparkles } from '../ui/Sparkles'
import { playSticker } from '../audio/sound'
import { ROYAL_LOOKS, getRoyalLook } from './royal'

/** 실사 공주 — 3D 인형 렌더 룩을 고르고 별로 모으는 업그레이드 꾸미기. */
export function RoyalDressUp() {
  const { go } = useNavigation()
  const { progress, dispatch } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const [selected, setSelected] = useState(progress.royalUnlocked[0] ?? 'pink')
  const [celebrate, setCelebrate] = useState(false)

  const unlocked = new Set(progress.royalUnlocked)
  const current = getRoyalLook(selected) ?? ROYAL_LOOKS[0]

  function tapLook(id: string) {
    const look = getRoyalLook(id)!
    if (unlocked.has(id)) { setSelected(id); speak(look.name); return }
    if (progress.stars < look.cost) { speak('별이 조금 더 필요해요'); return }
    dispatch({ type: 'unlockRoyal', id })
    setSelected(id)
    setCelebrate(true); playSticker(); speak('참 예뻐요!')
    window.setTimeout(() => setCelebrate(false), 900)
  }

  // 큰 공주 미리보기
  const preview = (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-card)', background: 'var(--c-card)', width: '100%', maxWidth: 300 }}>
      {celebrate && <Sparkles />}
      <img src={current.file} alt={current.name} style={{ width: '100%', display: 'block', aspectRatio: '3 / 4', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px',
        background: 'linear-gradient(transparent, rgba(70,40,60,0.55))', color: '#fff',
        fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>{current.name}</div>
    </div>
  )

  // 룩 썸네일 모음
  const picker = (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800, color: 'var(--c-ink-soft)', margin: '0 4px 8px', textAlign: 'center' }}>
        공주를 골라요 ({unlocked.size} / {ROYAL_LOOKS.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {ROYAL_LOOKS.map((look) => {
          const have = unlocked.has(look.id)
          const isSel = selected === look.id
          const affordable = progress.stars >= look.cost
          return (
            <button key={look.id} onClick={() => tapLook(look.id)}
              style={{ position: 'relative', border: isSel ? '3px solid var(--c-pink)' : '2px solid #f0e2d0',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--c-card)', padding: 0,
                cursor: 'pointer', boxShadow: 'var(--shadow-card)', opacity: have || affordable ? 1 : 0.6 }}>
              <img src={look.file} alt={look.name} aria-hidden={!have}
                style={{ width: '100%', display: 'block', aspectRatio: '3 / 4', objectFit: 'cover',
                  filter: have ? 'none' : 'grayscale(0.6) brightness(0.9)' }} />
              <div style={{ padding: '5px 4px', fontSize: 12.5, fontWeight: 800,
                color: have ? 'var(--c-ink)' : 'var(--c-ink-soft)', textAlign: 'center' }}>
                {have ? look.name : `🔒 ⭐${look.cost}`}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 25, marginTop: 4 }}>✨ 진짜 공주</h1>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#fff0b8,#ffd24d)',
        color: '#7a5a10', fontWeight: 800, fontSize: 18, padding: '6px 14px', borderRadius: 999, boxShadow: 'var(--shadow-card)' }}>⭐ {progress.stars}</div>

      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center',
        justifyContent: 'center', gap: landscape ? 28 : 12, width: '100%', maxWidth: landscape ? 760 : 360, marginTop: 4 }}>
        {preview}
        {picker}
      </div>
    </div>
  )
}
