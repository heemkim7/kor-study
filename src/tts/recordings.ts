// 부모 목소리 녹음으로 '전환'하기 위한 연결고리.
// 텍스트 -> 오디오 파일 경로 매핑. 비어 있으면 모든 음성은 브라우저 TTS로 재생됩니다.
// 녹음 파일을 public/audio/ 에 넣고 아래에 한 줄씩 추가하면, 그 텍스트는 녹음으로 재생돼요.
// (코드 변경 없이 콘텐츠 추가만으로 전환됨)
export const RECORDINGS: Record<string, string> = {
  // 예시(파일을 추가하면 주석 해제):
  // '사과': '/audio/words/apple.mp3',
  // '어느 맑은 날, 곰돌이는 친구들과 과일나라로 소풍을 갔어요.': '/audio/story/fruit-1-0.mp3',
}

/** 주어진 텍스트에 대한 녹음 파일 경로(없으면 null). */
export function resolveRecording(text: string): string | null {
  return RECORDINGS[text] ?? null
}
