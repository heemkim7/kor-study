import { Icon } from './Icon'

export function SpeakerButton({ onClick, size = 44 }: { onClick: () => void; size?: number }) {
  return (
    <button onClick={onClick} aria-label="다시 듣기" className="kp-tile"
      style={{ '--tile-a': '#fff3e0', '--tile-b': '#ffd9a8', '--tile-lip': 'var(--lip-orange)',
        width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}>
      <Icon n="speaker" size={size * 0.62} />
    </button>
  )
}
