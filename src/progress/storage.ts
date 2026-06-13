import { initialProgress, type Progress } from './progress'
import { isKnownItem, DEFAULT_OWNED_IDS } from '../princess/catalog'

const KEY = 'hangeul-play:progress:v1'

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialProgress
    const parsed = JSON.parse(raw) as Partial<Progress>
    // 중첩 필드(outfit/ownedItems)는 초기값 위에 병합해 전방 호환 보장.
    const ownedItems = Array.from(
      new Set([...DEFAULT_OWNED_IDS, ...(parsed.ownedItems ?? [])]),
    ).filter(isKnownItem)
    return {
      ...initialProgress,
      ...parsed,
      ownedItems,
      outfit: { ...initialProgress.outfit, ...(parsed.outfit ?? {}) },
    }
  } catch {
    return initialProgress
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* 저장 실패는 조용히 무시 (사용성 우선) */
  }
}
