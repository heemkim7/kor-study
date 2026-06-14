// 레벨이 올라갈수록 난이도 상승. (정답 포함) 보기 수와 방해 타일 수가 늘어남.

/** 보기 수(정답 포함). L1=2 … 최대 4 (4세 화면에 적당) */
export function choiceCountForLevel(level: number): number {
  return Math.min(2 + Math.max(0, level - 1), 4)
}

/** 난이도 별 개수(표시용). 1~3 */
export function difficultyStars(level: number): number {
  return Math.min(Math.max(1, level), 3)
}
