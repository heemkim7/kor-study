import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useProgress } from '../progress/useProgress'
import { useNavigation } from './Navigation'
import { ParentGate } from './ParentGate'
import { isOverTimeLimit, playSecondsToday, todayStr, TIME_BONUS_MIN } from '../progress/progress'

const TICK_SEC = 10 // 이 간격마다 논 시간을 누적(화면이 보일 때만)

/** 부모·안전: 하루 놀이 시간을 누적하고, 제한을 넘으면 '쉬는 시간' 잠금 화면을 띄운다.
 *  보호자 화면(설정 변경)은 잠그지 않는다 — 거기서 시간을 늘리거나 끌 수 있다. */
export function TimeGuard({ children }: { children: ReactNode }) {
  const { progress, dispatch } = useProgress()
  const { screen } = useNavigation()
  const [gateOpen, setGateOpen] = useState(false)

  // 활성 시간 누적 — 화면이 보일 때만 TICK_SEC씩 더한다(백그라운드는 제외).
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        dispatchRef.current({ type: 'addPlaySeconds', today: todayStr(), sec: TICK_SEC })
      }
    }, TICK_SEC * 1000)
    return () => window.clearInterval(id)
  }, [])

  const today = todayStr()
  const locked = isOverTimeLimit(progress, today) && screen.name !== 'parent'
  if (!locked) return <>{children}</>

  const usedMin = Math.floor(playSecondsToday(progress, today) / 60)

  if (gateOpen) {
    return (
      <ParentGate title="보호자 확인"
        onPass={() => { dispatch({ type: 'grantBonusMinutes', today, min: TIME_BONUS_MIN }); setGateOpen(false) }}
        onCancel={() => setGateOpen(false)} />
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 14, padding: 28, textAlign: 'center' }}>
      <img src="/img/mascot.webp" alt="" aria-hidden
        style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-card)' }} />
      <div style={{ fontSize: 44 }}>🌙</div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, margin: 0 }}>오늘은 여기까지!</h1>
      <p style={{ fontSize: 16, color: 'var(--c-ink-soft)', lineHeight: 1.5, maxWidth: 320 }}>
        오늘 {usedMin}분 동안 열심히 놀았어요.<br />눈을 쉬어 주고 내일 또 만나요! 👋
      </p>
      <button onClick={() => setGateOpen(true)}
        style={{ marginTop: 10, border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 26px', minHeight: 50,
          fontFamily: 'var(--font-warm)', fontSize: 16, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a', cursor: 'pointer' }}>
        🔒 보호자 확인하고 {TIME_BONUS_MIN}분 더
      </button>
    </div>
  )
}
