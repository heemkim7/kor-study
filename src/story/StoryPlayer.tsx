import { useEffect, useMemo, useState } from 'react'
import type { Lesson } from '../content/types'
import { getWordsByIds } from '../content/loader'
import { useTts } from '../tts/useTts'
import { splitByTargets } from './highlight'
import { SpeakerButton } from '../ui/SpeakerButton'

export function StoryPlayer({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const { speak } = useTts()
  const [i, setI] = useState(0)
  const scene = lesson.story[i]
  const isLast = i === lesson.story.length - 1

  const targetTexts = useMemo(
    () => getWordsByIds(scene.targets).map((w) => w.text),
    [scene.targets],
  )
  const parts = useMemo(() => splitByTargets(scene.text, targetTexts), [scene.text, targetTexts])

  useEffect(() => { speak(scene.text) }, [i]) // 장면이 바뀔 때 자동 낭독

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 0 18px' }}>
      <div style={{ position: 'relative', margin: '0 14px', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', boxShadow: 'var(--shadow-card)', aspectRatio: '4 / 3' }}>
        <img src={`/img/scene/${scene.sceneImage}.svg`} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 12, right: 14 }}>
          <SpeakerButton onClick={() => speak(scene.text)} />
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,.92)', margin: '14px 14px 0', borderRadius: 'var(--radius-md)',
        padding: '18px 20px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
        <p style={{ fontFamily: 'var(--font-warm)', fontSize: 26, lineHeight: 1.5 }}>
          {parts.map((p, idx) =>
            p.target ? (
              <span key={idx} style={{ color: 'var(--c-pink)', fontSize: 32, fontWeight: 800, padding: '0 3px' }}>{p.text}</span>
            ) : (
              <span key={idx}>{p.text}</span>
            ),
          )}
        </p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <button onClick={() => (isLast ? onDone() : setI(i + 1))}
          style={{ fontFamily: 'var(--font-warm)', fontSize: 22, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '14px 30px', boxShadow: '0 5px 0 #d98a3a' }}>
          {isLast ? '다음으로 ▶' : '다음 장면 ▶'}
        </button>
      </div>
    </div>
  )
}
