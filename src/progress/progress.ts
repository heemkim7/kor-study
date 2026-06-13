export interface Progress {
  stars: number
  stickers: number
  learnedWords: string[]
  completedLessons: string[]
  princessName: string | null
}

export const initialProgress: Progress = {
  stars: 0,
  stickers: 0,
  learnedWords: [],
  completedLessons: [],
  princessName: null,
}

export function addStars(p: Progress, n: number): Progress {
  return { ...p, stars: p.stars + n }
}

export function learnWords(p: Progress, ids: string[]): Progress {
  return { ...p, learnedWords: Array.from(new Set([...p.learnedWords, ...ids])) }
}

export function completeLesson(p: Progress, lessonId: string): Progress {
  if (p.completedLessons.includes(lessonId)) return p
  return {
    ...p,
    completedLessons: [...p.completedLessons, lessonId],
    stickers: p.stickers + 1,
  }
}

export function setPrincessName(p: Progress, name: string): Progress {
  return { ...p, princessName: name }
}
