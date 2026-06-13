import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { allLessons } from '../content/loader'
import type { Theme } from '../content/types'

const THEME_EMOJI: Partial<Record<Theme, string>> = {
  food: '🍓', animals: '🐶', vehicles: '🚌', nature: '🌙',
  family: '👪', colorshape: '🎨', body: '✋', home: '🏡',
}

export function Home() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const lessons = allLessons()

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        ⭐ {progress.stars} · 🏅 {progress.stickers}
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 34 }}>우리 딸 한글 놀이</h1>
      <p style={{ color: 'var(--c-ink-soft)', marginTop: -10 }}>오늘은 어떤 이야기로 놀까요?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 360, marginTop: 4 }}>
        {lessons.map((lesson) => {
          const done = progress.completedLessons.includes(lesson.id)
          return (
            <button key={lesson.id}
              onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
              style={{ fontFamily: 'var(--font-warm)', fontSize: 24, fontWeight: 800, color: '#fff',
                background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-lg)',
                padding: '20px 22px', boxShadow: '0 6px 0 #d98a3a', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
              <span style={{ fontSize: 30 }}>{THEME_EMOJI[lesson.theme] ?? '🎒'}</span>
              <span>{lesson.title}</span>
              {done && <span style={{ fontSize: 22 }} aria-label="완료">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
