import { useEffect } from 'react'
import { useTts } from '../tts/useTts'
import { useProgress } from '../progress/useProgress'
import { getSticker } from './stickers'
import { Sparkles } from '../ui/Sparkles'
import { Icon } from '../ui/Icon'
import { Kong } from '../ui/Kong'
import { useNavigation } from '../app/Navigation'
import { recommendNext } from '../app/recommend'
import { canPlayLesson, FREE_ENTITLEMENT } from '../entitlement/entitlement'
import { playReward, playSticker } from '../audio/sound'

export function RewardScreen({ onHome, awarded = true, stars }: { onHome: () => void; awarded?: boolean; stars?: number }) {
  const { speak } = useTts()
  const { progress } = useProgress()
  const { go } = useNavigation()
  // 끝나면 홈으로 돌아가 다시 고르지 않아도 되게 '다음 놀이'를 바로 권한다
  const next = recommendNext(progress.completedLessons)
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
      justifyContent: 'center', gap: 18, padding: 24, textAlign: 'center', position: 'relative' }}>
      <Sparkles />
      <div className="kp-pop"><Kong pose={stars === 3 ? 'star' : 'cheer'} size={150} bob /></div>
      <h1 className="kp-title" style={{ fontSize: 36 }}>참 잘했어요!</h1>
      {stars != null && (
        <div className="kp-pop" aria-label={`별 ${stars}개`} style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <span key={i} style={{ opacity: i <= stars ? 1 : 0.25, filter: i <= stars ? 'none' : 'grayscale(1)' }}><Icon n="star" size={56} /></span>
          ))}
        </div>
      )}
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 360 }}>
        {next && (
          <button className="kp-primary" onClick={() => go(canPlayLesson(next.track.nodes.indexOf(next.node), FREE_ENTITLEMENT) ? next.node.screen : { name: 'paywall' })}
            style={{ width: '100%', fontSize: 24, color: '#fff', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: '16px 24px', boxShadow: '0 5px 0 #d98a3a' }}>
            다음 놀이 · {next.node.title} ▶
          </button>
        )}
        <button className="kp-tile" onClick={onHome}
          style={{ '--tile-a': '#ffffff', '--tile-b': '#f3e9d6', '--tile-lip': '#dcc9a6', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: '10px 26px', fontFamily: 'var(--font-warm)', fontSize: 20, color: 'var(--c-ink)' } as React.CSSProperties}>
          <Icon n="home" size={30} /> 집으로
        </button>
      </div>
    </div>
  )
}
