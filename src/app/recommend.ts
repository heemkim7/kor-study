import type { Screen } from './Navigation'
import { allLessons, getWord } from '../content/loader'
import { buildJourney } from '../content/journey'
import { buildLetterJourney } from '../content/letters'
import { buildNumberJourney } from '../content/numbers'
import { buildAbcJourney } from '../content/english'

export type Subject = 'hangul' | 'number' | 'english'
export type TrackId = 'letters' | 'words' | 'number' | 'abc'

export interface TrackNode {
  id: string
  title: string
  sub: string
  completed: boolean
  current: boolean   // 이 트랙에서 '다음에 할 것'(앞에서부터 첫 미완료)
  screen: Screen
  badge: { img?: string; text?: string }   // 수업 카드 대표 그림(단어) 또는 대표 글자
}
export interface Track { id: TrackId; subject: Subject; label: string; nodes: TrackNode[] }

/** 네 트랙(글자·단어·숫자·영어)의 수업 목록. 수업은 모두 열려 있고(잠금 없음) current는 '추천'일 뿐이다. */
export function buildTracks(done: string[]): Track[] {
  const mark = <T extends { current: boolean }>(nodes: T[]) => {
    const i = nodes.findIndex((n) => !(n as unknown as { completed: boolean }).completed)
    return nodes.map((n, k) => ({ ...n, current: k === i }))
  }
  const letters = mark(buildLetterJourney(done).map((n) => ({
    id: n.lesson.id, title: n.lesson.title, sub: n.lesson.glyphs.join(' · '), completed: n.completed, current: false,
    screen: { name: 'letter', lessonId: n.lesson.id } as Screen, badge: { text: n.lesson.glyphs[0] } })))
  const words = mark(buildJourney(allLessons(), done).map((n) => ({
    id: n.lesson.id, title: n.lesson.title, sub: n.lesson.unit ?? '', completed: n.completed, current: false,
    screen: { name: 'adventure', lessonId: n.lesson.id } as Screen,
    badge: { img: (() => { const w = getWord(n.lesson.targetWords[0]); return w?.image.type === 'fluent' && w.image.name ? `/img/word/${w.image.name}.webp` : undefined })() } })))
  const number = mark(buildNumberJourney(done).map((n) => ({
    id: n.lesson.id, title: n.lesson.title, sub: n.lesson.unit, completed: n.completed, current: false,
    screen: { name: 'number', lessonId: n.lesson.id } as Screen, badge: { text: String(n.lesson.numbers[0]) } })))
  const abc = mark(buildAbcJourney(done).map((n) => ({
    id: n.lesson.id, title: n.lesson.title, sub: n.lesson.unit, completed: n.completed, current: false,
    screen: { name: 'abc', lessonId: n.lesson.id } as Screen, badge: { text: n.lesson.letters[0] } })))
  return [
    { id: 'letters', subject: 'hangul', label: '글자 배우기', nodes: letters },
    { id: 'words', subject: 'hangul', label: '단어 익히기', nodes: words },
    { id: 'number', subject: 'number', label: '숫자 배우기', nodes: number },
    { id: 'abc', subject: 'english', label: '알파벳', nodes: abc },
  ]
}

export interface Recommendation { track: Track; node: TrackNode }

/** 오늘의 놀이: 가장 덜 진행된 트랙의 다음 수업(동률이면 글자→숫자→영어→단어 순). 전부 끝났으면 null. */
export function recommendNext(done: string[]): Recommendation | null {
  const order: TrackId[] = ['letters', 'number', 'abc', 'words']
  const open = buildTracks(done)
    .filter((t) => t.nodes.some((n) => n.current))
    .map((t) => ({ t, ratio: t.nodes.filter((n) => n.completed).length / t.nodes.length }))
    .sort((a, b) => a.ratio - b.ratio || order.indexOf(a.t.id) - order.indexOf(b.t.id))
  if (!open.length) return null
  const t = open[0].t
  return { track: t, node: t.nodes.find((n) => n.current)! }
}
