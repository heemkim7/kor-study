import { toSyllables } from '../hangul/decompose'
import { shuffle } from './choices'

export interface BuildTiles {
  answer: string[] // 정답 음절(슬롯 순서)
  tiles: string[] // 섞인 타일(정답 음절 + 방해 음절)
}

/**
 * 정답 단어의 음절 + 방해 음절(정답에 없는 것) distractors개 → 섞은 타일.
 * 아이가 타일을 순서대로 눌러 단어를 완성한다.
 */
export function buildSyllableTiles(
  answerText: string,
  distractorSyllables: string[],
  distractors = 1,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): BuildTiles {
  const answer = toSyllables(answerText)
  const answerSet = new Set(answer)
  const uniq = [...new Set(distractorSyllables)].filter((s) => !answerSet.has(s))
  const picked = shuffleFn(uniq).slice(0, Math.max(0, distractors))
  const tiles = shuffleFn([...answer, ...picked])
  return { answer, tiles }
}
