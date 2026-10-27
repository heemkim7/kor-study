import { useNavigation } from './Navigation'
import { FREE_LESSONS_PER_TRACK } from '../entitlement/entitlement'

// 구독 안내 화면. 결제 연동(스토어/PG)이 붙기 전에는 '준비 중' 상태로만 보인다(PAYWALL_ENABLED=false 이면 아예 열리지 않음).
const PERKS = ['모든 한글·숫자·영어 레슨', '진짜 공주 모든 룩', '새 이야기와 그림 계속 추가', '광고 없음 · 아이 안전']

export function Paywall() {
  const { go } = useNavigation()
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="집으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20,
          boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 26, marginTop: 4 }}>🌟 더 많이 배워요</h1>
      <p style={{ fontSize: 14, color: 'var(--c-ink-soft)', textAlign: 'center', maxWidth: 320 }}>
        무료로 각 과목 처음 {FREE_LESSONS_PER_TRACK}개 레슨을 즐길 수 있어요. 구독하면 모든 레슨이 열려요.
      </p>
      <div style={{ width: '100%', maxWidth: 360, padding: '16px 18px', borderRadius: 'var(--radius-lg)',
        background: 'var(--c-card)', boxShadow: 'var(--shadow-card)', textAlign: 'left' }}>
        {PERKS.map((t) => (
          <div key={t} style={{ fontSize: 15, fontWeight: 700, padding: '6px 0', color: 'var(--c-ink)' }}>✅ {t}</div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', textAlign: 'center', maxWidth: 320 }}>
        구독 결제는 준비 중이에요. 보호자 화면에서 안내를 확인해 주세요.
      </div>
      <button onClick={() => go({ name: 'parent' })}
        style={{ height: 52, minWidth: 220, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: '#fff', background: 'var(--c-accent)',
          boxShadow: '0 5px 0 #d98a3a' }}>보호자 화면으로</button>
    </div>
  )
}
