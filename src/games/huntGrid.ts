import { shuffle } from './choices'

/**
 * target 음절을 targetCount개 포함하고 나머지 칸은 방해 음절(target과 다른)로 채운 size칸 격자.
 * 아이가 target 음절만 모두 찾는다.
 */
export function buildHuntGrid(
  target: string,
  distractorSyllables: string[],
  size = 9,
  targetCount = 3,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): string[] {
  const tCount = Math.max(1, Math.min(targetCount, size))
  const fillers = [...new Set(distractorSyllables)].filter((s) => s !== target)
  const cells: string[] = Array.from({ length: tCount }, () => target)
  let i = 0
  while (cells.length < size) {
    cells.push(fillers.length ? fillers[i % fillers.length] : target)
    i++
  }
  return shuffleFn(cells)
}
