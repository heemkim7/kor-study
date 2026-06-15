import { useEffect, useRef } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useTts } from '../tts/useTts'
import { allLessons } from '../content/loader'
import { buildJourney, type JourneyNode } from '../content/journey'
import { difficultyStars } from '../content/difficulty'
import { buildLetterJourney, type LetterNode } from '../content/letters'
import { buildNumberJourney, type NumNode } from '../content/numbers'
import { buildAbcJourney, type AbcNode } from '../content/english'
import type { Theme } from '../content/types'

export type Subject = 'hangul' | 'number' | 'english'

const THEME_EMOJI: Partial<Record<Theme, string>> = {
  food: '🍓', animals: '🐶', vehicles: '🚌', nature: '🌙',
  family: '👪', colorshape: '🎨', body: '✋', home: '🏡',
}

function groupByUnit<T extends { lesson: { unit?: string } }>(nodes: T[]): { unit: string; nodes: T[] }[] {
  const out: { unit: string; nodes: T[] }[] = []
  for (const node of nodes) {
    const unit = node.lesson.unit ?? '기타'
    const last = out[out.length - 1]
    if (last && last.unit === unit) last.nodes.push(node)
    else out.push({ unit, nodes: [node] })
  }
  return out
}

export function SubjectScreen({ subject }: { subject: Subject }) {
  const { go } = useNavigation()
  const { progress } = useProgress()
  const { speak } = useTts()
  const currentRef = useRef<HTMLButtonElement>(null)

  const wordJourney = buildJourney(allLessons(), progress.completedLessons)
  const currentIdx = wordJourney.findIndex((n) => n.current)
  // 진행이 쌓인 복귀 사용자는 '지금 도전' 카드로 자동 스크롤
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (subject === 'hangul' && currentIdx > 3) currentRef.current?.scrollIntoView({ block: 'center' }) }, [])

  const renderNumberNode = ({ lesson, completed, unlocked, current }: NumNode) => {
    const badge = completed ? '⭐' : unlocked ? String(lesson.numbers[0]) : '🔒'
    const state = completed ? ' · 완료!' : current ? ' · 지금 배워요!' : !unlocked ? ' · 잠김' : ''
    return (
      <button key={lesson.id} aria-disabled={!unlocked}
        onClick={() => (unlocked ? go({ name: 'number', lessonId: lesson.id }) : speak('먼저 앞 숫자를 배워요'))}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '13px 16px',
          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', background: 'var(--c-card)',
          boxShadow: current ? '0 0 0 3px #7fd0a0, var(--shadow-card)' : 'var(--shadow-card)', opacity: unlocked ? 1 : 0.6 }}>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-warm)', fontSize: 24,
          fontWeight: 800, color: '#fff', background: completed ? 'var(--c-correct)' : unlocked ? '#3ec46d' : '#c9bba8' }}>
          {badge}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>🔢 {lesson.title}</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2 }}>세고 비교해요{state}</div>
        </div>
      </button>
    )
  }

  const renderAbcNode = ({ lesson, completed, unlocked, current }: AbcNode) => {
    const badge = completed ? '⭐' : unlocked ? lesson.letters[0] : '🔒'
    const state = completed ? ' · 완료!' : current ? ' · 지금 배워요!' : !unlocked ? ' · 잠김' : ''
    return (
      <button key={lesson.id} aria-disabled={!unlocked}
        onClick={() => (unlocked ? go({ name: 'abc', lessonId: lesson.id }) : speak('먼저 앞 글자를 배워요'))}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '13px 16px',
          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', background: 'var(--c-card)',
          boxShadow: current ? '0 0 0 3px #8fcdee, var(--shadow-card)' : 'var(--shadow-card)', opacity: unlocked ? 1 : 0.6 }}>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-warm)', fontSize: 24,
          fontWeight: 800, color: '#fff', background: completed ? 'var(--c-correct)' : unlocked ? '#3aa0d0' : '#c9bba8' }}>
          {badge}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>🔤 {lesson.title}</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2 }}>듣고·찾고·따라써요{state}</div>
        </div>
      </button>
    )
  }

  const renderLetterNode = ({ lesson, completed, unlocked, current }: LetterNode) => {
    const badge = completed ? '⭐' : unlocked ? lesson.glyphs[0] : '🔒'
    const state = completed ? ' · 완료!' : current ? ' · 지금 배워요!' : !unlocked ? ' · 잠김' : ''
    return (
      <button key={lesson.id} aria-disabled={!unlocked}
        onClick={() => (unlocked ? go({ name: 'letter', lessonId: lesson.id }) : speak('먼저 앞 글자를 배워요'))}
        style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '13px 16px',
          borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', background: 'var(--c-card)',
          boxShadow: current ? '0 0 0 3px #b89be0, var(--shadow-card)' : 'var(--shadow-card)', opacity: unlocked ? 1 : 0.6 }}>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-warm)', fontSize: completed ? 24 : 26,
          fontWeight: 800, color: '#fff', background: completed ? 'var(--c-correct)' : unlocked ? '#9b6bff' : '#c9bba8' }}>
          {badge}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>📖 {lesson.title}</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2, letterSpacing: 2 }}>{lesson.glyphs.join(' · ')}{state}</div>
        </div>
      </button>
    )
  }

  const renderWordNode = ({ lesson, completed, unlocked, current }: JourneyNode) => {
    const emoji = THEME_EMOJI[lesson.theme] ?? '🎒'
    const stars = difficultyStars(lesson.level)
    const badge = completed ? '⭐' : unlocked ? String(lesson.level) : '🔒'
    const state = completed ? ' · 완료!' : current ? ' · 지금 도전!' : !unlocked ? ' · 잠김' : ''
    const baseStyle = {
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '13px 16px',
      borderRadius: 'var(--radius-lg)', border: 'none', background: 'var(--c-card)',
      boxShadow: current ? '0 0 0 3px var(--c-accent), var(--shadow-card)' : 'var(--shadow-card)',
      opacity: unlocked ? 1 : 0.6, cursor: 'pointer',
    } as const
    const inner = (
      <>
        <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: completed ? 24 : 20, fontWeight: 800,
          color: '#fff', background: completed ? 'var(--c-correct)' : unlocked ? 'var(--c-accent)' : '#c9bba8' }}>{badge}</div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>{emoji} {lesson.title}</div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2 }}>난이도 {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}{state}</div>
        </div>
      </>
    )
    return unlocked
      ? <button key={lesson.id} ref={current ? currentRef : undefined} onClick={() => go({ name: 'adventure', lessonId: lesson.id })} style={baseStyle}>{inner}</button>
      : <button key={lesson.id} onClick={() => speak('먼저 앞 단계를 끝내요')} style={baseStyle} aria-disabled="true">{inner}</button>
  }

  const section = (title: string, desc: string, headColor: string, body: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380, marginTop: 8 }}>
      <div style={{ fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: headColor, textAlign: 'left', margin: '4px 4px 0' }}>{title}</div>
      <p style={{ fontSize: 12.5, color: 'var(--c-ink-soft)', textAlign: 'left', margin: '0 4px 2px' }}>{desc}</p>
      {body}
    </div>
  )

  const unitBlock = <T extends { lesson: { unit?: string } }>(groups: { unit: string; nodes: T[] }[], unitColor: string, render: (n: T) => React.ReactNode) =>
    groups.map((g) => (
      <div key={g.unit} style={{ width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800, color: unitColor, textAlign: 'left', margin: '10px 4px 6px' }}>{g.unit}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{g.nodes.map(render)}</div>
      </div>
    ))

  const title = subject === 'hangul' ? '📖 한글' : subject === 'number' ? '🔢 숫자' : '🔤 영어'

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, padding: 'max(16px, env(safe-area-inset-top)) 16px 32px', position: 'relative' }}>
      <button onClick={() => go({ name: 'home' })} aria-label="홈으로"
        style={{ position: 'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 10, width: 44, height: 44,
          borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.9)', fontSize: 20, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>🏠</button>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 28, marginTop: 4 }}>{title}</h1>

      {subject === 'hangul' && <>
        {section('📖 글자 배우기', '자음·모음부터 차근차근 한글을 깨쳐요', '#7a4fc0',
          unitBlock(groupByUnit(buildLetterJourney(progress.completedLessons)), '#9b6bff', renderLetterNode))}
        {section('🍓 단어 익히기', '그림과 함께 통글자 단어를 익혀요', 'var(--c-accent-strong)',
          unitBlock(groupByUnit(wordJourney), 'var(--c-accent-strong)', renderWordNode))}
      </>}

      {subject === 'number' &&
        section('🔢 숫자 배우기', '수를 세고 많고 적음을 익혀요', '#2a9d6e',
          unitBlock(groupByUnit(buildNumberJourney(progress.completedLessons)), '#3ec46d', renderNumberNode))}

      {subject === 'english' &&
        section('🔤 알파벳', '듣고·찾고·따라쓰며 알파벳을 익혀요', '#2b8fc0',
          unitBlock(groupByUnit(buildAbcJourney(progress.completedLessons)), '#3aa0d0', renderAbcNode))}
    </div>
  )
}
