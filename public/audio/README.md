# 음성 파일 (부모 목소리 녹음 — 선택)

기본은 브라우저 TTS로 읽습니다. **부모 목소리로 바꾸고 싶을 때**만 여기에 녹음을 넣으세요.

## 전환 방법 (코드 수정 없음)
1. 읽어줄 문장/단어를 mp3로 녹음해 이 폴더에 저장.
   - 권장 구조: `public/audio/words/<id>.mp3`, `public/audio/story/<lessonId>-<장면번호>.mp3`
   - 예: `public/audio/words/apple.mp3`, `public/audio/story/fruit-1-0.mp3`
2. `src/tts/recordings.ts` 의 `RECORDINGS` 에 **읽을 텍스트 → 파일 경로**를 한 줄 추가.
   ```ts
   export const RECORDINGS = {
     '사과': '/audio/words/apple.mp3',
     '어느 맑은 날, 곰돌이는 친구들과 과일나라로 소풍을 갔어요.': '/audio/story/fruit-1-0.mp3',
   }
   ```
3. 끝. 해당 텍스트는 부모 목소리로 재생되고, 매핑이 없는 텍스트는 그대로 TTS로 읽어요.

## 참고
- 텍스트는 화면 자막/단어와 **정확히 같게** 적어야 매칭됩니다(띄어쓰기·문장부호 포함).
- 파일에 문제가 있으면 자동으로 TTS로 폴백합니다.
- 녹음은 오프라인에서도 동작하도록 앱에 번들됩니다(서비스워커가 mp3도 캐시하려면
  `vite.config.ts` 의 `globPatterns` 에 `mp3` 추가).
