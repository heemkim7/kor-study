import { useEffect, type ReactNode } from 'react'
import { useNavigation, type Screen } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useViewport } from './FitShell'
import { useTts } from '../tts/useTts'
import { allLessons } from '../content/loader'
import { buildJourney } from '../content/journey'
import { difficultyStars } from '../content/difficulty'
import { buildLetterJourney } from '../content/letters'
import { buildNumberJourney } from '../content/numbers'
import { buildAbcJourney } from '../content/english'

export type Subject = 'hangul' | 'number' | 'english'

// 트랙 노드 공통 형태(글자/단어/숫자/영어 모두 동일 구조). 부가 필드는 옵셔널.
type Node = {
  lesson: { id: string; title: string; level?: number; glyphs?: string[] }
  completed: boolean; unlocked: boolean; current: boolean
}

export function SubjectScreen({ subject }: { subject: Subject }) {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { landscape } = useViewport()
  const { speak } = useTts()
  const done = progress.completedLessons

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(subject === 'hangul' ? '한글을 배워요' : subject === 'number' ? '숫자를 배워요' : '영어를 배워요') }, [])

  // 한 트랙: '지금 배울 것'을 큰 카드로 + 나머지는 진행 점으로 압축(스크롤 없이 한 화면).
  function track(
    emoji: string, label: string, color: string, nodes: Node[],
    nav: (id: string) => Screen, subtitleOf: (n: Node) => string,
  ) {
    const total = nodes.length
    const doneCount = nodes.filter((n) => n.completed).length
    const cur = nodes.find((n) => n.current)
    // 이 트랙에서 모은 마스터리 별 합계(레슨별 1~3)
    const trackStars = nodes.reduce((s, n) => s + (progress.lessonStars[n.lesson.id] ?? 0), 0)
    return (
      <div key={label} style={{ flex: landscape ? '1 1 380px' : '0 0 auto', width: '100%', maxWidth: 410, marginTop: landscape ? 0 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 4px 8px' }}>
          <span style={{ fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color }}>{emoji} {label}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-ink-soft)' }}>
            {trackStars > 0 && <span style={{ color: '#e0a020' }}>⭐{trackStars} · </span>}{doneCount} / {total} 완료
          </span>
        </div>

        {cur ? (
          <button onClick={() => go(nav(cur.lesson.id))}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '18px 18px',
              borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', background: 'var(--c-card)',
              boxShadow: `0 0 0 3px ${color}, var(--shadow-card)` }}>
            <div style={{ width: 56, height: 56, flex: '0 0 auto', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-warm)', fontSize: 26,
              fontWeight: 800, color: '#fff', background: color }}>▶</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 1 }}>지금 배워요</div>
              <div style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: 'var(--c-ink)' }}>{cur.lesson.title}</div>
              <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 1 }}>{subtitleOf(cur)}</div>
            </div>
          </button>
        ) : (
          <div style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--c-card)',
            boxShadow: 'var(--shadow-card)', textAlign: 'center', fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800 }}>
            🎉 다 배웠어요! 정말 잘했어요
          </div>
        )}

        {/* 진행 점(완료=색, 지금=링, 잠김=빈칸) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 10 }}>
          {nodes.map((n) => (
            <span key={n.lesson.id} aria-hidden style={{ width: 12, height: 12, borderRadius: 999,
              background: n.completed ? color : '#e7dcc9',
              boxShadow: n.current ? `0 0 0 2px ${color}` : 'none' }} />
          ))}
        </div>
      </div>
    )
  }

  // 가로 화면에서 단일 트랙(숫자·영어) 옆을 채우는 장식 패널 — 좌우 여백 대신 보기 좋은 안내.
  function heroPanel(big: string, letters: string, tip: string, color: string) {
    return (
      <div key="hero" style={{ flex: '1 1 320px', maxWidth: 380, alignSelf: 'stretch', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24,
        borderRadius: 'var(--radius-lg)', background: 'var(--c-card)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 72 }}>{big}</div>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 34, fontWeight: 800, letterSpacing: 6, color }}>{letters}</div>
        <div style={{ fontSize: 15, color: 'var(--c-ink-soft)', fontWeight: 700 }}>{tip}</div>
      </div>
    )
  }

  const title = subject === 'hangul' ? '📖 한글' : subject === 'number' ? '🔢 숫자' : '🔤 영어'

  // 트랙 모음 — 과목별
  const tracks: ReactNode[] = []
  if (subject === 'hangul') {
    tracks.push(track('📖', '글자 배우기', '#9b6bff', buildLetterJourney(done),
      (id) => ({ name: 'letter', lessonId: id }), (n) => n.lesson.glyphs?.join(' · ') ?? ''))
    tracks.push(track('🍓', '단어 익히기', 'var(--c-accent-strong)', buildJourney(allLessons(), done),
      (id) => ({ name: 'adventure', lessonId: id }), (n) => `난이도 ${'★'.repeat(difficultyStars(n.lesson.level ?? 1))}`))
  } else if (subject === 'number') {
    tracks.push(track('🔢', '숫자 배우기', '#3ec46d', buildNumberJourney(done),
      (id) => ({ name: 'number', lessonId: id }), () => '수를 세고 비교해요'))
    if (landscape) tracks.push(heroPanel('🧮', '1 2 3', '하나 둘 셋, 같이 세어요', '#3ec46d'))
  } else {
    tracks.push(track('🔤', '알파벳', '#3aa0d0', buildAbcJourney(done),
      (id) => ({ name: 'abc', lessonId: id }), () => '듣고·찾고·따라써요'))
    if (landscape) tracks.push(heroPanel('🔤', 'A B C', '듣고 따라 읽어요', '#3aa0d0'))
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, padding: 'max(16px, env(safe-area-inset-top)) 16px 28px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, marginTop: 4 }}>{title}</h1>

      {subject === 'hangul' && progress.reviewWords.length > 0 && (
        <button onClick={() => go({ name: 'review' })}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 380, padding: '12px 16px',
            borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', marginTop: 4,
            background: 'linear-gradient(135deg,#ffe0e8,#fff2f5)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 26 }}>🔁</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: 'var(--c-pink)' }}>복습하기</div>
            <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>틀린 단어 {progress.reviewWords.length}개 다시 보기</div>
          </div>
          <div style={{ fontSize: 20 }}>▶</div>
        </button>
      )}

      {/* 트랙 — 가로면 좌우로 펼침, 세로면 위아래로 */}
      <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', flexWrap: 'wrap',
        alignItems: landscape ? 'flex-start' : 'center', justifyContent: 'center',
        gap: landscape ? 20 : 0, width: '100%', maxWidth: landscape ? 860 : 410, marginTop: 8 }}>
        {tracks}
      </div>
    </div>
  )
}
