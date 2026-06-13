import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { allLessons } from '../content/loader'
import { buildJourney } from '../content/journey'
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
  const journey = buildJourney(allLessons(), progress.completedLessons)

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14, padding: '24px 16px 32px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        ⭐ {progress.stars} · 🏅 {progress.stickers}
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 32 }}>우리 딸 한글 여정</h1>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 380, marginTop: 6 }}>
        {journey.map(({ lesson, completed, unlocked, current }) => {
          const emoji = THEME_EMOJI[lesson.theme] ?? '🎒'
          const stars = difficultyStars(lesson.level)
          const badge = completed ? '⭐' : unlocked ? String(lesson.level) : '🔒'
          const state = completed ? ' · 완료!' : current ? ' · 지금 도전!' : !unlocked ? ' · 잠김' : ''
          const baseStyle = {
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: 'none',
            background: 'var(--c-card)',
            boxShadow: current ? '0 0 0 3px var(--c-accent), var(--shadow-card)' : 'var(--shadow-card)',
            opacity: unlocked ? 1 : 0.6,
          } as const
          const inner = (
            <>
              <div style={{ width: 52, height: 52, flex: '0 0 auto', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: completed ? 26 : 22, fontWeight: 800, color: '#fff',
                background: completed ? 'var(--c-correct)' : unlocked ? 'var(--c-accent)' : '#c9bba8' }}>
                {badge}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-warm)', fontSize: 21, fontWeight: 800, color: 'var(--c-ink)' }}>
                  {emoji} {lesson.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--c-ink-soft)', marginTop: 2 }}>
                  난이도 {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}{state}
                </div>
              </div>
            </>
          )
          return unlocked ? (
            <button key={lesson.id} onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
              style={{ ...baseStyle, cursor: 'pointer' }}>
              {inner}
            </button>
          ) : (
            <div key={lesson.id} style={baseStyle} aria-disabled="true">
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
