// 레벨이 올라갈수록 난이도 상승. (정답 포함) 보기 수와 방해 타일 수가 늘어남.

/** 보기 수(정답 포함). L1=2 … 최대 4 (4세 화면에 적당) */
export function choiceCountForLevel(level: number): number {
  return Math.min(2 + Math.max(0, level - 1), 4)
}

/** 난이도 별 개수(표시용). 레벨 구간으로 1~3 분산해 긴 커리큘럼에서도 진행감을 준다. */
export function difficultyStars(level: number): number {
  if (level <= 4) return 1
  if (level <= 12) return 2
  return 3
}
