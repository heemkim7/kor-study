import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { allLessons } from '../content/loader'

export function Home() {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const lesson = allLessons()[0]

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 16, right: 20, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
        ⭐ {progress.stars} · 🏅 {progress.stickers}
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 34 }}>우리 딸 한글 놀이</h1>
      <button
        onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 28, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-lg)',
          padding: '22px 40px', boxShadow: '0 6px 0 #d98a3a' }}>
        🎒 오늘의 모험 시작
      </button>
      <div style={{ color: 'var(--c-ink-soft)' }}>{lesson.title}</div>
    </div>
  )
}
