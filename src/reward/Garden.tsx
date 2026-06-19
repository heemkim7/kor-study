import { useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useTts } from '../tts/useTts'
import { playSticker } from '../audio/sound'
import { PLANT_COST, MAX_GARDEN } from '../progress/progress'
import { PLANTS, getPlant, MAX_PLANT_STAGE } from './plants'

/** 마법 정원 — 별로 꽃을 심고, 학습할 때마다(레슨 완료) 새싹→꽃으로 자라는 '나만의 공간'. 물주기는 무료. */
export function Garden() {
  const { go } = useNavigation()
  const { progress, dispatch } = useProgress()
  const { speak } = useTts()
  const [picking, setPicking] = useState(false)
  const [popIdx, setPopIdx] = useState<number | null>(null)

  const full = progress.garden.length >= MAX_GARDEN
  const canPlant = !full && progress.stars >= PLANT_COST

  function tapPlant(i: number) {
    const g = progress.garden[i]
    if (g.stage >= MAX_PLANT_STAGE) { speak('활짝 폈어요'); return }
    dispatch({ type: 'waterPlant', index: i })
    playSticker()
    setPopIdx(i)
    window.setTimeout(() => setPopIdx(null), 450)
  }
  function plant(plantId: string) {
    setPicking(false)
    if (progress.stars < PLANT_COST) { speak('별이 조금 더 필요해요'); return }
    dispatch({ type: 'plantSeed', plantId })
    speak('씨앗을 심었어요')
  }

  // 빈 슬롯 한 칸을 '＋'로 표시(정원이 가득 차기 전까지)
  const slots = [...progress.garden.map((g, i) => ({ kind: 'plant' as const, g, i })),
    ...(full ? [] : [{ kind: 'add' as const }])]

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 4 }}>🪴 마법 정원</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#fff0b8,#ffd24d)',
          color: '#7a5a10', fontWeight: 800, fontSize: 18, padding: '6px 14px', borderRadius: 999, boxShadow: 'var(--shadow-card)' }}>⭐ {progress.stars}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: -2 }}>놀이를 하면 꽃이 무럭무럭 자라요 · 꽃을 누르면 물을 줘요</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, width: '100%', maxWidth: 460,
        marginTop: 4, background: 'linear-gradient(180deg,#eafaf0,#f4fff8)', borderRadius: 'var(--radius-lg)', padding: 12,
        boxShadow: 'var(--shadow-card)' }}>
        {slots.map((s) => {
          if (s.kind === 'add') {
            return (
              <button key="add" onClick={() => (canPlant ? setPicking(true) : speak(full ? '정원이 가득 찼어요' : '별이 조금 더 필요해요'))}
                style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 2, borderRadius: 'var(--radius-md)', border: '3px dashed #b8e0c4', background: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', opacity: canPlant ? 1 : 0.55 }}>
                <span style={{ fontSize: 30 }}>＋</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)' }}>⭐{PLANT_COST} 심기</span>
              </button>
            )
          }
          const plant = getPlant(s.g.plantId)!
          return (
            <button key={s.i} onClick={() => tapPlant(s.i)} className={popIdx === s.i ? 'kp-pop' : undefined}
              style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
              <span style={{ fontSize: 40 }}>{plant.stages[s.g.stage]}</span>
            </button>
          )
        })}
        {slots.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: 'var(--c-ink-soft)', fontWeight: 700 }}>
            아직 비어 있어요. 별로 첫 꽃을 심어 보세요!
          </div>
        )}
      </div>

      {/* 꽃 고르기 */}
      {picking && (
        <div onClick={() => setPicking(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.5)', zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: 20, maxWidth: 360, width: '100%', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>어떤 꽃을 심을까요?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {PLANTS.map((p) => (
                <button key={p.id} onClick={() => plant(p.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px',
                    borderRadius: 'var(--radius-md)', border: 'none', background: '#f4fff8', boxShadow: '0 4px 0 #d7efe0', cursor: 'pointer' }}>
                  <span style={{ fontSize: 34 }}>{p.stages[MAX_PLANT_STAGE]}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink)' }}>{p.name}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--c-ink-soft)', fontWeight: 800 }}>한 그루 ⭐{PLANT_COST} · 내 별 ⭐{progress.stars}</div>
          </div>
        </div>
      )}
    </div>
  )
}
