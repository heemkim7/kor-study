import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useTts } from '../tts/useTts'
import { allLessons } from '../content/loader'
import { buildJourney, type JourneyNode } from '../content/journey'
import { difficultyStars } from '../content/difficulty'
import { PrincessFigure } from '../princess/PrincessFigure'
import type { Theme } from '../content/types'

const THEME_EMOJI: Partial<Record<Theme, string>> = {
  food: '🍓', animals: '🐶', vehicles: '🚌', nature: '🌙',
  family: '👪', colorshape: '🎨', body: '✋', home: '🏡',
}

export function Home() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { speak } = useTts()
  const journey = buildJourney(allLessons(), progress.completedLessons)

  // 주차/단원(unit)별로 묶기(순서 유지)
  const groups: { unit: string; nodes: JourneyNode[] }[] = []
  for (const node of journey) {
    const unit = node.lesson.unit ?? '기타'
    const last = groups[groups.length - 1]
    if (last && last.unit === unit) last.nodes.push(node)
    else groups.push({ unit, nodes: [node] })
  }

  const renderNode = ({ lesson, completed, unlocked, current }: JourneyNode) => {
    const emoji = THEME_EMOJI[lesson.theme] ?? '🎒'
    const stars = difficultyStars(lesson.level)
    const badge = completed ? '⭐' : unlocked ? String(lesson.level) : '🔒'
    const state = completed ? ' · 완료!' : current ? ' · 지금 도전!' : !unlocked ? ' · 잠김' : ''
    const baseStyle = {
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      padding: '13px 16px', borderRadius: 'var(--radius-lg)', border: 'none',
      background: 'var(--c-card)',
      boxShadow: current ? '0 0 0 3px var(--c-accent), var(--shadow-card)' : 'var(--shadow-card)',
      opacity: unlocked ? 1 : 0.6,
    } as const
    const inner = (
      <>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: completed ? 24 : 20, fontWeight: 800, color: '#fff',
          background: completed ? 'var(--c-correct)' : unlocked ? 'var(--c-accent)' : '#c9bba8' }}>
          {badge}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>
            {emoji} {lesson.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2 }}>
            난이도 {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}{state}
          </div>
        </div>
      </>
    )
    return unlocked ? (
      <button key={lesson.id} onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
        style={{ ...baseStyle, cursor: 'pointer' }}>{inner}</button>
    ) : (
      <button key={lesson.id} onClick={() => speak('먼저 앞 단계를 끝내요')}
        style={{ ...baseStyle, cursor: 'pointer' }} aria-disabled="true">{inner}</button>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(20px, env(safe-area-inset-top)) 16px 32px', textAlign: 'center' }}>
      <div style={{ alignSelf: 'flex-end', fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        ⭐ {progress.stars} · 🏅 {progress.stickers}
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 32, marginTop: -4 }}>우리 딸 한글 여정</h1>
      <p style={{ color: 'var(--c-ink-soft)', marginTop: -8 }}>한 단계씩 올라가며 한글을 배워요</p>

      {/* 공주 꾸미기 입구 */}
      <button onClick={() => go({ name: 'dressup' })}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 380,
          padding: '12px 18px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#ffe4f1,#fff0f8)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ width: 56, height: 88, flex: '0 0 auto' }}>
          <PrincessFigure outfit={progress.outfit} size={56} animate background={false} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 21, fontWeight: 800, color: 'var(--c-pink)' }}>
            👗 공주 꾸미기
          </div>
          <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>
            별 ⭐{progress.stars}개로 옷과 왕관을 모아요
          </div>
        </div>
        <div style={{ fontSize: 24 }}>▶</div>
      </button>

      {/* 주차별 여정 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380, marginTop: 4 }}>
        {groups.map((g) => (
          <div key={g.unit} style={{ width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800,
              color: 'var(--c-accent-strong)', textAlign: 'left', margin: '12px 4px 6px' }}>
              {g.unit}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.nodes.map(renderNode)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
