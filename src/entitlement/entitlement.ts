// 구독(프리미엄) 권한 판정 — 순수 함수. 결제 연동(스토어/PG)은 별도 계정이 필요해
// 여기서는 '무엇이 무료이고 무엇이 유료인가'만 정의한다. PAYWALL_ENABLED=false 이면 전부 무료(현재 라이브 동작 유지).

/** 결제 연동이 끝나기 전까지 false. true 로 바꾸기 전에 반드시 결제·복원 흐름을 붙일 것. */
export const PAYWALL_ENABLED = false

/** 트랙(글자/단어/숫자/영어)마다 무료로 열어 두는 앞쪽 레슨 수. */
export const FREE_LESSONS_PER_TRACK = 2

export interface Entitlement {
  /** 유료 구독 중인가 */
  premium: boolean
}

export const FREE_ENTITLEMENT: Entitlement = { premium: false }

/** 트랙 안에서 index번째(0부터) 레슨을 놀 수 있는가. */
export function canPlayLesson(index: number, ent: Entitlement, enabled: boolean = PAYWALL_ENABLED): boolean {
  if (!enabled || ent.premium) return true
  return index < FREE_LESSONS_PER_TRACK
}

/** 유료 때문에 잠긴 레슨이 몇 개인가(구독 안내 문구용). */
export function lockedCount(total: number, ent: Entitlement, enabled: boolean = PAYWALL_ENABLED): number {
  if (!enabled || ent.premium) return 0
  return Math.max(0, total - FREE_LESSONS_PER_TRACK)
}
