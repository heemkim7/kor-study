export function SpeakerButton({ onClick, size = 44 }: { onClick: () => void; size?: number }) {
  return (
    <button onClick={onClick} aria-label="다시 듣기"
      style={{ width: size, height: size, borderRadius: '50%', border: 'none',
        background: '#ffe2c2', color: 'var(--c-accent-strong)', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z" />
      </svg>
    </button>
  )
}
