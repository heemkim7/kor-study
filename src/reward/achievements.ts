// 업적(뱃지) — 기존 진행 신호(배운 단어·완료 레슨·스트릭·스티커·별)만으로 평가. 신규 상태 0.
import type { Progress } from '../progress/progress'
import { STICKERS } from './stickers'

export interface Achievement {
  id: string
  emoji: string
  name: string
  desc: string
  done: (p: Progress) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', emoji: '🌱', name: '첫 걸음', desc: '첫 놀이를 마쳤어요', done: (p) => p.completedLessons.length >= 1 },
  { id: 'lessons5', emoji: '⭐', name: '놀이 다섯 판', desc: '놀이 5개 완료', done: (p) => p.completedLessons.length >= 5 },
  { id: 'lessons15', emoji: '🏅', name: '꾸준왕', desc: '놀이 15개 완료', done: (p) => p.completedLessons.length >= 15 },
  { id: 'lessons30', emoji: '🎖️', name: '놀이 마스터', desc: '놀이 30개 완료', done: (p) => p.completedLessons.length >= 30 },
  { id: 'words10', emoji: '🍓', name: '단어 친구', desc: '단어 10개 배우기', done: (p) => p.learnedWords.length >= 10 },
  { id: 'words30', emoji: '📚', name: '단어 박사', desc: '단어 30개 배우기', done: (p) => p.learnedWords.length >= 30 },
  { id: 'streak3', emoji: '🔥', name: '3일 연속', desc: '3일 연속 놀기', done: (p) => p.streak >= 3 },
  { id: 'streak7', emoji: '🌟', name: '일주일 개근', desc: '7일 연속 놀기', done: (p) => p.streak >= 7 },
  { id: 'stickers10', emoji: '🎯', name: '스티커 수집가', desc: '스티커 10장 모으기', done: (p) => p.collectedStickers.length >= 10 },
  { id: 'stickersAll', emoji: '👑', name: '스티커 마스터', desc: `스티커 ${STICKERS.length}장 모두`, done: (p) => p.collectedStickers.length >= STICKERS.length },
  { id: 'stars30', emoji: '✨', name: '별 모으기', desc: '별 30개 모으기', done: (p) => p.stars >= 30 },
  { id: 'stars80', emoji: '💫', name: '별 부자', desc: '별 80개 모으기', done: (p) => p.stars >= 80 },
]

export function earnedAchievements(p: Progress): number {
  return ACHIEVEMENTS.filter((a) => a.done(p)).length
}
