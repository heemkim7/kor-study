import { useEffect } from 'react'
import { useTts } from '../tts/useTts'
import { useProgress } from '../progress/useProgress'
import { getSticker } from './stickers'
import { playReward, playSticker } from '../audio/sound'

export function RewardScreen({ onHome, awarded = true }: { onHome: () => void; awarded?: boolean }) {
  const { speak } = useTts()
  const { progress } = useProgress()
  // 방금 모은(가장 최근) 스티커
  const latest = awarded ? getSticker(progress.collectedStickers[progress.collectedStickers.length - 1]) : undefined

  // 보상 화면 진입 시 1회: 팡파르 효과음(+스티커 반짝) 후 축하 음성
  useEffect(() => {
    playReward()
    if (awarded) playSticker()
    speak(awarded ? '참 잘했어요! 스티커를 받았어요.' : '참 잘했어요!')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 96 }}>🎉</div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 30 }}>참 잘했어요!</h1>
      {awarded && latest && (
        <div className="kp-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          background: 'var(--c-card)', borderRadius: 'var(--radius-lg)', padding: '16px 26px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 60 }}>{latest.emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
            ‘{latest.name}’ 스티커 획득!
          </div>
        </div>
      )}
      {awarded && !latest && (
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
