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

/**
 * 정답 1 + 오답으로 count개 보기. 단, "헷갈리는" 오답을 우선 고른다.
 * prefs: 우선순위 높은 순으로 나열한 선호 조건. 각 티어를 차례로 채우고,
 * 그래도 부족하면 남은 풀에서 채운다.
 *  - 그림 퀴즈: 같은 테마(비슷한 그림)를 우선  → [sameTheme]
 *  - 단어 퀴즈: 같은 글자수(+가능하면 같은 테마)를 우선 → [sameThemeLen, sameLen]
 * 이렇게 하면 "사과 vs 자동차"처럼 생뚱맞은 보기 대신 비슷한 보기가 나와 난이도가 올라간다.
 */
export function buildSmartChoices(
  answer: string,
  pool: string[],
  count: number,
  prefs: Array<(id: string) => boolean> = [],
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): string[] {
  const others = shuffleFn(pool.filter((x) => x !== answer))
  const need = Math.max(0, count - 1)
  const chosen: string[] = []
  const take = (filter: (id: string) => boolean) => {
    for (const id of others) {
      if (chosen.length >= need) break
      if (!chosen.includes(id) && filter(id)) chosen.push(id)
    }
  }
  for (const pref of prefs) take(pref)
  take(() => true) // 선호로 못 채우면 나머지에서 보충
  return shuffleFn([answer, ...chosen])
}
