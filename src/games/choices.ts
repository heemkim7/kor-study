export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 정답 1 + 오답(정답 제외 풀에서)로 count개 보기 생성 후 섞기 */
export function buildChoices(
  answer: string,
  pool: string[],
  count: number,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): string[] {
  const distractors = shuffleFn(pool.filter((x) => x !== answer)).slice(0, Math.max(0, count - 1))
  return shuffleFn([answer, ...distractors])
}
