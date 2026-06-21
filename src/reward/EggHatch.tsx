import { useState } from 'react'
import { useNavigation } from '../app/Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from '../app/FitShell'
import { useTts } from '../tts/useTts'
import { Sparkles } from '../ui/Sparkles'
import { playReward, playSticker } from '../audio/sound'
import { EGG_CRACK_TARGET } from '../progress/progress'
import { PETS, getPet, nextUnhatchedPet, type Pet } from './pets'

/** 알 키우기 — 별을 써서 알을 두드려 아기동물을 '순서대로' 부화시키는 수집 보상(꽝 없음). */
export function EggHatch() {
  const { go } = useNavigation()
  const { progress, dispatch } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const [reveal, setReveal] = useState<Pet | null>(null)
  const [wiggle, setWiggle] = useState(false)

  const hatched = new Set(progress.hatchedPets)
  const next = nextUnhatchedPet(progress.hatchedPets)
  const allDone = next === null

  function tap() {
    if (allDone) { speak('아기 친구들을 모두 모았어요'); return }
    if (progress.stars < 1) { speak('별이 조금 더 필요해요'); return }
    // 이번 두드림으로 부화하는지 미리 판정(dispatch 전 현재 상태 기준)
    const willHatch = progress.eggCrackStep + 1 >= EGG_CRACK_TARGET
    dispatch({ type: 'crackEgg' })
    if (willHatch && next) {
      const pet = getPet(next)!
      setReveal(pet)
      playReward()
      speak(pet.name)
    } else {
      setWiggle(true)
      playSticker()
      window.setTimeout(() => setWiggle(false), 450)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>

      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 4 }}>🥚 알 키우기</h1>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#fff0b8,#ffd24d)',
        color: '#7a5a10', fontWeight: 800, fontSize: 18, padding: '6px 14px', borderRadius: 999, boxShadow: 'var(--shadow-card)' }}>⭐ {progress.stars}</div>

      {/* 알 + 진행 + 두드리기 / 도감 — 가로면 좌우 2단 */}
      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center',
        justifyContent: 'center', gap: landscape ? 30 : 12, width: '100%', maxWidth: landscape ? 820 : 420, marginTop: 4 }}>
        {/* 알 패널 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className={wiggle ? 'kp-pop' : undefined} style={{ fontSize: 132, lineHeight: 1 }} aria-hidden>
            {allDone ? '🐣' : '🥚'}
          </div>
          {/* 균열 진행 점 */}
          {!allDone && (
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: EGG_CRACK_TARGET }).map((_, i) => (
                <span key={i} aria-hidden style={{ width: 16, height: 16, borderRadius: 999,
                  background: i < progress.eggCrackStep ? 'var(--c-accent)' : '#e7dcc9' }} />
              ))}
            </div>
          )}
          <button onClick={tap} disabled={allDone}
            style={{ border: 'none', borderRadius: 'var(--radius-md)', padding: '16px 30px', minHeight: 56,
              fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff', cursor: allDone ? 'default' : 'pointer',
              background: allDone ? '#cdbfa6' : 'linear-gradient(135deg, var(--c-pink), var(--c-accent))',
              boxShadow: allDone ? 'none' : '0 5px 0 #c4578f' }}>
            {allDone ? '다 모았어요! 🎉' : '톡! 두드리기 (⭐1)'}
          </button>
        </div>

        {/* 모은 친구 도감 */}
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800, color: 'var(--c-ink-soft)', margin: '0 4px 8px', textAlign: 'center' }}>
            모은 친구 {hatched.size} / {PETS.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {PETS.map((pet) => {
              const have = hatched.has(pet.id)
              return (
                <button key={pet.id} disabled={!have} onClick={() => speak(pet.name)}
                  style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2, borderRadius: 'var(--radius-md)', border: 'none',
                    background: have ? 'var(--c-card)' : '#efe7da', boxShadow: have ? 'var(--shadow-card)' : 'none',
                    cursor: have ? 'pointer' : 'default' }}>
                  <span style={{ fontSize: 30, opacity: have ? 1 : 0.3 }}>{have ? pet.emoji : '❓'}</span>
                  {have && <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-ink-soft)' }}>{pet.name}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 부화 결과 */}
      {reveal && (
        <div onClick={() => setReveal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(70,40,60,0.5)', zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', background: 'var(--c-card)', borderRadius: 'var(--radius-lg)',
              padding: '28px 28px 22px', textAlign: 'center', maxWidth: 340, width: '100%', boxShadow: 'var(--shadow-card)' }}>
            <Sparkles />
            <div style={{ fontSize: 120, lineHeight: 1 }}>{reveal.emoji}</div>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 24, fontWeight: 800, marginTop: 6 }}>{reveal.name} 친구 탄생! 🎉</div>
            <button onClick={() => setReveal(null)}
              style={{ marginTop: 16, border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 30px', minHeight: 50,
                fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: '#fff', background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a' }}>
              좋아요!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
