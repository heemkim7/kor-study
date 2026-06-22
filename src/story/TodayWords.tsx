import { useEffect } from 'react'
import type { Lesson } from '../content/types'
import { getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { WordImage } from '../ui/WordImage'

export function TodayWords({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { speak } = useTts()
  const words = getWordsByIds(lesson.targetWords)

  // 진입 안내(1회)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak('오늘 배울 단어예요') }, [])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 18, padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-warm)', fontSize: 26 }}>오늘 배울 단어</h2>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {words.map((w) => (
          <button key={w.id} onClick={() => speak(w.text)} aria-label={`${w.text} 듣기`}
            style={{ position: 'relative', background: 'var(--c-card)', border: 'none', borderRadius: 'var(--radius-lg)',
              padding: 18, boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8 }}>
            {/* 눌러서 들을 수 있다는 표시(아직 글 못 읽는 아이용) */}
            <span aria-hidden style={{ position: 'absolute', top: 8, right: 8, fontSize: 18 }}>🔊</span>
            <WordImage word={w} />
            <span style={{ fontFamily: 'var(--font-warm)', fontSize: 28, fontWeight: 800,
              letterSpacing: 3, color: 'var(--c-ink)' }}>{w.text}</span>
          </button>
        ))}
      </div>
      <button onClick={onDone}
        style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
          background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
          padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
        놀이하러 가기 ▶
      </button>
    </div>
  )
}
