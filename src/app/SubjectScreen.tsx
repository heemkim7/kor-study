import { useEffect } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { buildTracks, type Subject, type Track } from './recommend'
import { canPlayLesson, FREE_ENTITLEMENT } from '../entitlement/entitlement'
import { Icon } from '../ui/Icon'
import { Kong } from '../ui/Kong'

export type { Subject }

const SUBJECT_STYLE: Record<Subject, { title: string; icon: string; color: string; a: string; b: string; lip: string; say: string }> = {
  hangul: { title: '한글', icon: 'hangul', color: '#8a5cdd', a: '#f6f0ff', b: '#e0d1fc', lip: 'var(--lip-purple)', say: '한글을 배워요' },
  number: { title: '숫자', icon: 'number', color: '#2f9b5e', a: '#eefbf3', b: '#c7ecd7', lip: 'var(--lip-green)', say: '숫자를 배워요' },
  english: { title: '영어', icon: 'english', color: '#3b7fd0', a: '#eef5ff', b: '#c6dcf8', lip: 'var(--lip-blue)', say: '영어를 배워요' },
}

/** 과목 화면 — 수업이 전부 열려 있는 '수업 고르기'. 추천 수업만 표시하고 잠그지 않는다. */
export function SubjectScreen({ subject }: { subject: Subject }) {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const st = SUBJECT_STYLE[subject]
  const tracks = buildTracks(progress.completedLessons).filter((t) => t.subject === subject)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(st.say) }, [])

  function trackBlock(t: Track) {
    const total = t.nodes.length
    const doneCount = t.nodes.filter((n) => n.completed).length
    return (
      <div key={t.id} style={{ flex: landscape && tracks.length > 1 ? '1 1 380px' : '0 0 auto', width: '100%', maxWidth: 410 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 6px 8px' }}>
          <span className="kp-title" style={{ fontSize: 22, color: st.color }}>{t.label}</span>
          <span className="kp-chip" style={{ fontSize: 14, padding: '3px 12px' }}>{doneCount} / {total}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: 12 }}>
          {t.nodes.map((n, i) => {
            const stars = progress.lessonStars[n.id] ?? 0
            const open = canPlayLesson(i, FREE_ENTITLEMENT)
            return (
              <button key={n.id} className="kp-tile" onClick={() => go(open ? n.screen : { name: 'paywall' })}
                style={{ '--tile-a': n.completed ? '#fffdf5' : st.a, '--tile-b': n.completed ? '#fbe9b8' : st.b, '--tile-lip': n.completed ? 'var(--lip-yellow)' : st.lip,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  minHeight: 112, padding: '12px 6px 10px',
                  outline: n.current ? `4px solid ${st.color}` : 'none', outlineOffset: 2 } as React.CSSProperties}>
                {n.current && (
                  <span className="kp-bob" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: st.color, color: '#fff', fontFamily: 'var(--font-warm)', fontSize: 13, padding: '3px 12px',
                    borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 3px 0 rgba(0,0,0,.15)' }}>추천</span>
                )}
                <div style={{ position: 'relative', width: 64, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {n.badge.img
                    ? <img src={n.badge.img} alt="" aria-hidden draggable={false} style={{ height: 56, width: 'auto', maxWidth: 64, objectFit: 'contain', filter: 'drop-shadow(0 3px 2px rgba(60,40,20,.25))' }} />
                    : <span style={{ fontFamily: 'var(--font-warm)', fontSize: 46, lineHeight: 1, color: st.color, textShadow: '0 2px 0 #fff' }}>{n.badge.text}</span>}
                  {(n.completed || !open) && (
                    <span style={{ position: 'absolute', right: -6, top: -6, background: '#fff', borderRadius: '50%', width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 0 rgba(0,0,0,.12)' }}>
                      <Icon n={n.completed ? 'check' : 'lock'} size={20} />
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, color: 'var(--c-ink)', lineHeight: 1.15, textAlign: 'center' }}>{n.title}</div>
                {n.completed && (
                  <div aria-label={`별 ${stars}개`} style={{ display: 'flex', gap: 1 }}>
                    {[1, 2, 3].map((k) => <span key={k} style={{ opacity: k <= stars ? 1 : 0.22 }}><Icon n="star" size={16} /></span>)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 10, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
        <Icon n="home" size={30} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <img src={`/img/icons/${st.icon}.webp`} alt="" aria-hidden style={{ height: 54, width: 'auto' }} />
        <h1 className="kp-title" style={{ fontSize: 34 }}>{st.title}</h1>
      </div>

      {subject === 'hangul' && progress.reviewWords.length > 0 && (
        <button className="kp-tile" onClick={() => go({ name: 'review' })}
          style={{ '--tile-a': '#fff0f4', '--tile-b': '#ffd0dc', '--tile-lip': 'var(--lip-pink)',
            display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 380, padding: '10px 16px', marginTop: 4 } as React.CSSProperties}>
          <Kong pose="think" size={58} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, color: '#c24a6a' }}>복습하기</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-ink-soft)' }}>틀린 단어 {progress.reviewWords.length}개 다시 보기</div>
          </div>
          <Icon n="play" size={34} />
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', flexWrap: 'wrap',
        alignItems: landscape ? 'flex-start' : 'center', justifyContent: 'center', gap: landscape ? 24 : 26,
        width: '100%', maxWidth: landscape ? 840 : 410, marginTop: 14 }}>
        {tracks.map(trackBlock)}
      </div>
    </div>
  )
}
