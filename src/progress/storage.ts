import { initialProgress, EGG_CRACK_TARGET, MAX_GARDEN, MAX_FAMILY_WORDS, MAX_FAMILY_WORD_LEN, MAX_TIME_LIMIT_MIN, type Progress, type GardenPlant } from './progress'
import { isKnownItem, getItem, DEFAULT_OWNED_IDS, type ItemCategory, type Outfit } from '../princess/catalog'
import { getSticker } from '../reward/stickers'
import { getPet } from '../reward/pets'
import { getPlant, MAX_PLANT_STAGE } from '../reward/plants'
import { getRoyalLook, DEFAULT_ROYAL } from '../reward/royal'
import { getWord } from '../content/loader'

const KEY = 'hangeul-play:progress:v1'

/** YYYY-MM-DD 형식이면서 실제로 존재하는 날짜인지(2026-06-99 같은 값 거부). */
function isValidDateStr(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialProgress
    const parsed = JSON.parse(raw) as Partial<Progress>
    // 중첩 필드(outfit/ownedItems)는 초기값 위에 병합해 전방 호환 보장.
    const ownedItems = Array.from(
      new Set([...DEFAULT_OWNED_IDS, ...(parsed.ownedItems ?? [])]),
    ).filter(isKnownItem)
    // outfit의 각 슬롯은 '해당 카테고리의 보유 아이템'일 때만 인정(아니면 기본으로 폴백).
    // 손상/구버전 저장에서 미보유 슬롯이 '입는 중'으로 보여 재과금되는 버그 방지.
    const merged = { ...initialProgress.outfit, ...(parsed.outfit ?? {}) }
    const outfit: Record<ItemCategory, string> = { ...initialProgress.outfit }
    for (const k of Object.keys(initialProgress.outfit) as ItemCategory[]) {
      const id = merged[k]
      const item = getItem(id)
      if (item && item.category === k && ownedItems.includes(id)) outfit[k] = id
    }
    // 스티커도 카탈로그에 있는 id만 인정(손상/구버전 저장 방어)
    const collectedStickers = (parsed.collectedStickers ?? []).filter((id) => getSticker(id) !== undefined)
    // 스트릭 필드도 형식 검증(손상값이 daysBetween을 오염시키지 않게)
    const lastPlayedDate = isValidDateStr(parsed.lastPlayedDate) ? parsed.lastPlayedDate : null
    const streak = typeof parsed.streak === 'number' && Number.isInteger(parsed.streak) && parsed.streak >= 0
      ? parsed.streak : 0
    // 배운 단어·복습 단어도 실제 존재하는 단어만 인정(손상/삭제된 id 방어)
    const learnedWords = (parsed.learnedWords ?? []).filter((id) => getWord(id) !== undefined)
    const reviewWords = (parsed.reviewWords ?? []).filter((id) => getWord(id) !== undefined)
    // 일별 활동 로그·목표 검증(손상값 방어)
    const rawLog = parsed.playLog
    const playLog: Record<string, number> = (rawLog && typeof rawLog === 'object' && !Array.isArray(rawLog))
      ? Object.fromEntries(Object.entries(rawLog as Record<string, unknown>)
        .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0)) as Record<string, number>
      : {}
    const dailyGoal = typeof parsed.dailyGoal === 'number' && parsed.dailyGoal >= 1 && parsed.dailyGoal <= 5 ? parsed.dailyGoal : 1
    // 보상(알·정원·선물상자) 필드 검증 — 손상/구버전 방어
    const hatchedPets = (parsed.hatchedPets ?? []).filter((id) => getPet(id) !== undefined)
    const eggCrackStep = typeof parsed.eggCrackStep === 'number' && Number.isInteger(parsed.eggCrackStep)
      && parsed.eggCrackStep >= 0 && parsed.eggCrackStep < EGG_CRACK_TARGET ? parsed.eggCrackStep : 0
    const garden: GardenPlant[] = (Array.isArray(parsed.garden) ? parsed.garden : [])
      .filter((g): g is GardenPlant => !!g && typeof g === 'object'
        && getPlant((g as GardenPlant).plantId) !== undefined
        && Number.isInteger((g as GardenPlant).stage) && (g as GardenPlant).stage >= 0 && (g as GardenPlant).stage <= MAX_PLANT_STAGE)
      .slice(0, MAX_GARDEN)
    const lastChestDate = isValidDateStr(parsed.lastChestDate) ? parsed.lastChestDate : null
    // 실사 공주 룩 — 카탈로그에 있는 id만, 기본 룩은 항상 포함
    const royalUnlocked = Array.from(new Set([DEFAULT_ROYAL, ...((parsed.royalUnlocked ?? []).filter((id) => getRoyalLook(id) !== undefined))]))
    // 레슨 마스터리 별 — 값이 1~3 정수인 항목만
    const rawStars = parsed.lessonStars
    const lessonStars: Record<string, number> = (rawStars && typeof rawStars === 'object' && !Array.isArray(rawStars))
      ? Object.fromEntries(Object.entries(rawStars as Record<string, unknown>)
        .filter(([, v]) => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 3)) as Record<string, number>
      : {}
    // 우리 가족 단어 — 비지 않은 짧은 문자열만, 중복 제거, 개수 제한
    const familyWords = Array.from(new Set((Array.isArray(parsed.familyWords) ? parsed.familyWords : [])
      .filter((w): w is string => typeof w === 'string' && w.trim().length > 0 && w.trim().length <= MAX_FAMILY_WORD_LEN)
      .map((w) => w.trim()))).slice(0, MAX_FAMILY_WORDS)
    // 시간 제한(분)·놀이 시간 로그·보너스 로그 검증
    const timeLimitMin = typeof parsed.timeLimitMin === 'number' && Number.isFinite(parsed.timeLimitMin)
      ? Math.max(0, Math.min(MAX_TIME_LIMIT_MIN, Math.round(parsed.timeLimitMin))) : 0
    const secondsLog = (raw: unknown): Record<string, number> =>
      (raw && typeof raw === 'object' && !Array.isArray(raw))
        ? Object.fromEntries(Object.entries(raw as Record<string, unknown>)
          .filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0)) as Record<string, number>
        : {}
    const playSecondsLog = secondsLog(parsed.playSecondsLog)
    const timeBonusLog = secondsLog(parsed.timeBonusLog)
    return { ...initialProgress, ...parsed, ownedItems, outfit: outfit as Outfit, collectedStickers, lastPlayedDate, streak, learnedWords, reviewWords, playLog, dailyGoal, hatchedPets, eggCrackStep, garden, lastChestDate, royalUnlocked, lessonStars, familyWords, timeLimitMin, playSecondsLog, timeBonusLog }
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
