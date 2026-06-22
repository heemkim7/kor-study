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

  function next() { if (isLast) onDone(); else setI(i + 1) }

  // 장면이 바뀌면 자동 낭독 → 낭독이 끝나고 3초 뒤 다음 장면으로 저절로 전환.
  // (4세는 터치가 서툴러 '다음' 버튼 없이 자동 진행. onEnd가 안 오는 환경 대비 안전 타이머 병행.)
  useEffect(() => {
    let advance: ReturnType<typeof setTimeout>
    let armed = false
    let cancelled = false // 장면 변경/언마운트 후 옛 onEnd가 늦게 와도 진행을 막음(경쟁 조건 방지)
    const arm = () => {
      if (armed || cancelled) return
      armed = true
      advance = setTimeout(() => { if (!cancelled) next() }, 3000)
    }
    speak(scene.text, { onEnd: arm })
    const fallback = setTimeout(arm, Math.max(4500, scene.text.length * 340))
    return () => { cancelled = true; clearTimeout(advance); clearTimeout(fallback) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 0 18px' }}>
      {/* 그림은 보는 것 — 아이가 만져도 스토리가 넘어가지 않게 탭-스킵을 없앴다(평소엔 자동 진행). */}
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
      {/* 진행 점 — 저절로 넘어가는 흐름을 보여줌 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 18 }}>
        {lesson.story.map((_, idx) => (
          <span key={idx} aria-hidden style={{ width: idx === i ? 13 : 8, height: idx === i ? 13 : 8,
            borderRadius: 999, background: idx === i ? 'var(--c-accent)' : '#e3cba8', transition: 'all .2s' }} />
        ))}
      </div>
      {/* 명시적 '다음' — 자동 진행을 기다리지 않고 넘기고 싶을 때(작아서 우발 탭 위험 낮음) */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
        <button onClick={next} aria-label={isLast ? '다 봤어요' : '다음 장면'}
          style={{ border: 'none', borderRadius: 999, padding: '12px 26px', minHeight: 48,
            fontFamily: 'var(--font-warm)', fontSize: 18, fontWeight: 800, color: '#fff',
            background: 'var(--c-accent)', boxShadow: '0 4px 0 #d98a3a', cursor: 'pointer' }}>
          {isLast ? '다 봤어요 ▶' : '다음 ▶'}
        </button>
      </div>
    </div>
  )
}
