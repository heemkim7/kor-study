import { useEffect, useRef, useState } from 'react'
import { useNavigation } from './Navigation'
import { useProgress } from '../progress/useProgress'
import { useTts } from '../tts/useTts'
import { allLessons } from '../content/loader'
import { buildJourney, type JourneyNode } from '../content/journey'
import { difficultyStars } from '../content/difficulty'
import { PrincessFigure } from '../princess/PrincessFigure'
import { STICKERS } from '../reward/stickers'
import { buildLetterJourney, type LetterNode } from '../content/letters'
import { todayStr } from '../progress/progress'
import { isBgmEnabled, toggleBgm, resumeAudio } from '../audio/sound'
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
  const currentRef = useRef<HTMLButtonElement>(null)
  const currentIdx = journey.findIndex((n) => n.current)
  const [bgmOn, setBgmOn] = useState(isBgmEnabled())
  const playedToday = progress.lastPlayedDate === todayStr()

  // 진행이 쌓인 복귀 사용자는 '지금 도전!' 카드로 자동 스크롤(앞쪽이면 그대로 둠)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (currentIdx > 3) currentRef.current?.scrollIntoView({ block: 'center' }) }, [])

  // 주차/단원(unit)별로 묶기(순서 유지)
  const groups: { unit: string; nodes: JourneyNode[] }[] = []
  for (const node of journey) {
    const unit = node.lesson.unit ?? '기타'
    const last = groups[groups.length - 1]
    if (last && last.unit === unit) last.nodes.push(node)
    else groups.push({ unit, nodes: [node] })
  }

  // 글자 배우기(자모) 트랙 — 단원별 묶기
  const letterJourney = buildLetterJourney(progress.completedLessons)
  const letterGroups: { unit: string; nodes: LetterNode[] }[] = []
  for (const node of letterJourney) {
    const unit = node.lesson.unit
    const last = letterGroups[letterGroups.length - 1]
    if (last && last.unit === unit) last.nodes.push(node)
    else letterGroups.push({ unit, nodes: [node] })
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
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 20, fontWeight: 800, color: 'var(--c-ink)' }}>
            📖 {lesson.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--c-ink-soft)', marginTop: 2, letterSpacing: 2 }}>
            {lesson.glyphs.join(' · ')}{state}
          </div>
        </div>
      </button>
    )
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
      <button key={lesson.id} ref={current ? currentRef : undefined}
        onClick={() => go({ name: 'adventure', lessonId: lesson.id })}
        style={{ ...baseStyle, cursor: 'pointer' }}>{inner}</button>
    ) : (
      <button key={lesson.id} onClick={() => speak('먼저 앞 단계를 끝내요')}
        style={{ ...baseStyle, cursor: 'pointer' }} aria-disabled="true">{inner}</button>
    )
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 12, padding: 'max(20px, env(safe-area-inset-top)) 16px 32px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 380 }}>
        <button onClick={() => { resumeAudio(); setBgmOn(toggleBgm()) }}
          aria-label={bgmOn ? '배경음악 끄기' : '배경음악 켜기'}
          style={{ width: 40, height: 40, borderRadius: 999, border: 'none', background: 'var(--c-card)',
            fontSize: 18, boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
          {bgmOn ? '🔊' : '🔇'}
        </button>
        <div style={{ fontWeight: 800, color: 'var(--c-accent-strong)' }}>
          {progress.streak > 0 && <>🔥 {progress.streak} · </>}⭐ {progress.stars} · 🏅 {progress.stickers}
        </div>
      </div>
      <h1 style={{ fontFamily: 'var(--font-warm)', fontSize: 32, marginTop: -4 }}>우리 딸 한글 여정</h1>
      <p style={{ color: 'var(--c-ink-soft)', marginTop: -8 }}>한 단계씩 올라가며 한글을 배워요</p>

      {/* 오늘의 목표 — 4세 배려: 달성/미달성 모두 긍정 문구 */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        borderRadius: 999, background: playedToday ? 'linear-gradient(135deg,#d6f5e0,#f0fff6)' : 'linear-gradient(135deg,#fff3d6,#fffaf0)',
        boxShadow: 'var(--shadow-card)', fontWeight: 800, fontSize: 14, color: 'var(--c-ink)' }}>
        {playedToday
          ? <>🎉 오늘 목표 달성! {progress.streak > 1 && `🔥 ${progress.streak}일 연속`}</>
          : <>🎯 오늘의 목표 · 놀이 1개 하기</>}
      </div>

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

      {/* 스티커 책 · 그림 그리기 입구 */}
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 380 }}>
        <button onClick={() => go({ name: 'stickers' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '12px 8px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#fff3d6,#fffaf0)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 30 }}>🏅</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: 'var(--c-accent-strong)' }}>
            스티커 책
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>
            {progress.collectedStickers.length} / {STICKERS.length}장
          </div>
        </button>
        <button onClick={() => go({ name: 'draw' })}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '12px 8px', borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#d9f2ff,#f0fbff)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 30 }}>🎨</div>
          <div style={{ fontFamily: 'var(--font-warm)', fontSize: 17, fontWeight: 800, color: '#3aa0d0' }}>
            그림 그리기
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-ink-soft)' }}>색칠하고 그려요</div>
        </button>
      </div>

      {/* 글자 배우기(자모) 트랙 — 한글 깨치기의 시작 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380, marginTop: 8 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: '#7a4fc0',
          textAlign: 'left', margin: '4px 4px 0' }}>📖 글자 배우기</div>
        <p style={{ fontSize: 12.5, color: 'var(--c-ink-soft)', textAlign: 'left', margin: '0 4px 2px' }}>
          자음·모음부터 차근차근 한글을 깨쳐요
        </p>
        {letterGroups.map((g) => (
          <div key={g.unit} style={{ width: '100%' }}>
            <div style={{ fontFamily: 'var(--font-warm)', fontSize: 15, fontWeight: 800,
              color: '#9b6bff', textAlign: 'left', margin: '10px 4px 6px' }}>
              {g.unit}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.nodes.map(renderLetterNode)}
            </div>
          </div>
        ))}
      </div>

      {/* 단어 익히기(통글자) 트랙 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 380, marginTop: 8 }}>
        <div style={{ fontFamily: 'var(--font-warm)', fontSize: 19, fontWeight: 800, color: 'var(--c-accent-strong)',
          textAlign: 'left', margin: '4px 4px 0' }}>🍓 단어 익히기</div>
        <p style={{ fontSize: 12.5, color: 'var(--c-ink-soft)', textAlign: 'left', margin: '0 4px 2px' }}>
          그림과 함께 통글자 단어를 익혀요
        </p>
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
