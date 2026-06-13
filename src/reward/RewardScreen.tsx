import { useEffect } from 'react'
import { useTts } from '../tts/useTts'

export function RewardScreen({ onHome, awarded = true }: { onHome: () => void; awarded?: boolean }) {
  const { speak } = useTts()
  // 보상 화면 진입 시 1회 축하 음성
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(awarded ? '참 잘했어요! 스티커를 받았어요.' : '참 잘했어요!') }, [])
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 96 }}>🎉</div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 30 }}>참 잘했어요!</h1>
      {awarded && (
        <div style={{ fontSize: 22, color: 'var(--c-accent-strong)', fontWeight: 800 }}>🏅 스티커 1장 획득!</div>
      )}
      <button onClick={onHome}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
        🏠 집으로
      </button>
    </div>
  )
}
