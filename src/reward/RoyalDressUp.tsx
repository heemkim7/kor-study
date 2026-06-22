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
  const [selected, setSelected] = useState(progress.royalUnlocked[0] ?? 'rose')
  const [celebrate, setCelebrate] = useState(false)
  const [buyId, setBuyId] = useState<string | null>(null)   // 데려오기 확인 대기
  const [denyId, setDenyId] = useState<string | null>(null) // 별 부족 흔들림

  const unlocked = new Set(progress.royalUnlocked)
  const current = getRoyalLook(selected) ?? ROYAL_LOOKS[0]
  const buyLook = buyId ? getRoyalLook(buyId) : null

  function tapLook(id: string) {
    const look = getRoyalLook(id)!
    if (unlocked.has(id)) { setSelected(id); speak(look.name); return }
    if (progress.stars < look.cost) {
      setDenyId(id); speak('별이 조금 더 필요해요')
      window.setTimeout(() => setDenyId((d) => (d === id ? null : d)), 450)
      return
    }
    setBuyId(id); speak('이 공주를 데려올까요?') // 한 번 더 확인(실수 차감 방지)
  }
  function confirmBuy() {
    const id = buyId
    setBuyId(null)
    if (!id) return
    dispatch({ type: 'unlockRoyal', id })
    setSelected(id)
    setCelebrate(true); playSticker(); speak('참 예뻐요!')
    window.setTimeout(() => setCelebrate(false), 900)
  }

  // 큰 공주 미리보기
  const preview = (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', flex: '0 0 auto',
      boxShadow: 'var(--shadow-card)', background: 'var(--c-card)', width: '100%', maxWidth: landscape ? 250 : 280 }}>
      {celebrate && <Sparkles />}
      <img src={current.file} alt={current.name} style={{ width: '100%', display: 'block', aspectRatio: '3 / 4', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px',
        background: 'linear-gradient(transparent, rgba(70,40,60,0.55))', color: '#fff',
        fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>{current.name}</div>
    </div>
  )

  // 룩 썸네일 모음 — 반응형 그리드(폭에 따라 칸 수 자동)
  const picker = (
    <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800, color: 'var(--c-ink-soft)', margin: '0 4px 8px', textAlign: 'center' }}>
        공주를 골라요 ({unlocked.size} / {ROYAL_LOOKS.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 10 }}>
        {ROYAL_LOOKS.map((look) => {
          const have = unlocked.has(look.id)
          const isSel = selected === look.id
          const affordable = progress.stars >= look.cost
          return (
            <button key={look.id} onClick={() => tapLook(look.id)} className={denyId === look.id ? 'kp-shake' : undefined}
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

      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: landscape ? 'flex-start' : 'center',
        justifyContent: 'center', gap: landscape ? 24 : 12, width: '100%', maxWidth: landscape ? 940 : 400, marginTop: 4 }}>
        {preview}
        {picker}
      </div>

      {/* 데려오기 확인 — 실수 탭으로 별이 사라지지 않게 한 번 더 확인 */}
      {buyLook && (
        <div onClick={() => setBuyId(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.5)', zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
              padding: '20px 20px 18px', textAlign: 'center', maxWidth: 300, width: '100%',
              maxHeight: 'calc(100dvh - 44px)', overflowY: 'auto', boxShadow: 'var(--shadow-card)' }}>
            <img src={buyLook.file} alt={buyLook.name}
              style={{ width: 150, aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 'var(--radius-md)', margin: '0 auto', display: 'block' }} />
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, marginTop: 8 }}>{buyLook.name}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-accent-strong)', margin: '6px 0 4px' }}>
              ⭐ {buyLook.cost} 에 데려올까요?
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginBottom: 12 }}>
              내 별 ⭐ {progress.stars} → {progress.stars - buyLook.cost}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={confirmBuy}
                style={{ flex: 1, border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 0', minHeight: 52,
                  fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: '#fff',
                  background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a' }}>데려와요</button>
              <button onClick={() => setBuyId(null)}
                style={{ flex: 1, border: 'none', borderRadius: 'var(--radius-md)', padding: '14px 0', minHeight: 52,
                  fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: 'var(--c-ink-soft)',
                  background: '#f0e7da' }}>아니요</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
