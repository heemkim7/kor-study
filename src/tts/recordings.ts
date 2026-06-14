// 텍스트 -> 오디오 파일 경로 매핑.
//  - GENERATED_RECORDINGS: 로컬 TTS로 미리 만든 mp3(scripts/gen-tts.mjs).
//  - RECORDINGS(수동): 부모 목소리 녹음 등으로 특정 문장을 덮어쓰고 싶을 때.
// 매핑이 없으면 브라우저 TTS로 폴백합니다.
import { GENERATED_RECORDINGS } from './recordings.generated'

// 수동 오버라이드(있으면 생성본보다 우선). 예: '사과': '/audio/parent/apple.mp3'
export const RECORDINGS: Record<string, string> = {}

/** 주어진 텍스트에 대한 녹음 파일 경로(없으면 null). 수동 > 생성본 우선. */
export function resolveRecording(text: string): string | null {
  return RECORDINGS[text] ?? GENERATED_RECORDINGS[text] ?? null
}
