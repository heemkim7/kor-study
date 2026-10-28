import type { CSSProperties, ReactNode } from 'react'

export interface CandyTileProps {
  icon: ReactNode          // 이모지 또는 <img>
  label: string
  sub?: string
  a: string                // 윗면 그라디언트 시작/끝색
  b: string
  lip: string              // 아랫 턱 색
  color?: string           // 글자색
  big?: boolean            // 과목 같은 큰 타일
  onClick: () => void
}

/** 눌리는 입체 타일 — 홈의 과목/놀이 메뉴 공용 */
export function CandyTile({ icon, label, sub, a, b, lip, color = 'var(--c-ink)', big, onClick }: CandyTileProps) {
  const style = { '--tile-a': a, '--tile-b': b, '--tile-lip': lip,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: big ? 6 : 3,
    minHeight: big ? 164 : 128, padding: big ? '16px 8px 14px' : '12px 6px 10px' } as CSSProperties
  return (
    <button className="kp-tile" onClick={onClick} style={style}>
      <div style={{ height: big ? 86 : 62, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: big ? 56 : 42, filter: 'drop-shadow(0 4px 3px rgba(60,40,20,.22))' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: big ? 24 : 17, color }}>{label}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink-soft)' }}>{sub}</div>}
    </button>
  )
}
