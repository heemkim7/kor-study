# 우리 딸 한글 놀이 🦊📖👑

48개월(만 4세) 아이를 위한 **이야기 중심 한글 놀이/학습 웹앱**(PWA).
이야기로 흥미를 끌고 → 강조된 단어를 → 놀이로 익히고 → 스티커로 공주를 꾸미는 구조.

> 현재 **Milestone 1**(핵심 학습 루프)까지 구현된 상태입니다.

## 지금 되는 것 (M1)
- 홈 → **이야기**(장면 그림 + 음성 낭독 + 자막에 오늘의 단어 강조) → **오늘의 단어** → **놀이**(듣고 그림 찾기 · 그림 보고 단어 고르기) → **🎉 보상**(스티커)
- 정답마다 별 획득 · 틀려도 벌·차감 없음(no-fail)
- 진행상황(별·스티커·배운 단어)은 기기에 저장(localStorage)
- **PWA**: 홈 화면 설치 + 오프라인 동작(앱 셸·그림 캐시)
- 한국어 **TTS**(브라우저 내장 음성)

## 실행
```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드(+서비스워커)
npm run preview   # 빌드 결과 미리보기(PWA/오프라인 확인)
npm run test      # 단위 테스트 (Vitest)
```
태블릿에서 같은 와이파이로 dev 서버 주소에 접속하거나, 배포 후 "홈 화면에 추가"로 앱처럼 사용.

## 구조
```
src/
  hangul/     음절·자모 분해 (순수, 테스트)
  content/    단어·레슨 데이터 + 로더/검증
  image/      이미지 리졸버 (Fluent→사진 폴백)
  tts/        한국어 음성 선택 + 재생 훅
  progress/   진행상황 리듀서 + localStorage + 컨텍스트
  story/      이야기 플레이어 + 오늘의 단어 + 자막 강조
  games/      보기 생성 + 듣고찾기 + 단어고르기
  reward/     보상 화면
  app/        네비게이션 + 홈 + 모험 오케스트레이터
public/img/   단어·장면 그림 (현재 임시 placeholder)
```

## 콘텐츠 추가
- 단어: `src/content/words.ts` 에 `{ id, text, theme, image }` 추가 (음절·자모는 코드가 자동 분해)
- 레슨: `src/content/lessons.ts` 에 이야기·오늘의 단어·놀이 구성 추가
- 그림: `public/img/fluent/<이름>.png` (지금은 단색 placeholder — 실제 그림으로 교체 예정)

## 문서
- 설계(스펙): `docs/superpowers/specs/2026-06-13-hangeul-play-design.md`
- 구현 계획: `docs/superpowers/plans/2026-06-13-hangeul-play-milestone-1.md`
- 수동 QA 체크리스트: `docs/superpowers/plans/m1-manual-qa.md`
- 공주 이미지 생성 프롬프트: `docs/assets/princess-image-prompts.md`

## 다음 단계 (예정)
- M2: 나머지 놀이(글자블록·자모찾기·메모리), 여정 맵, 스티커 북
- M3: 공주 꾸미기(레이어 믹스매치)·상점, 콘텐츠 확장, 배포

## 라이선스 / 참고
개인용 학습 프로젝트. 단어 그림은 추후 Microsoft Fluent Emoji(MIT) 또는 자체 제작으로 교체 예정.
공주 등 캐릭터 아트는 **오리지널**로 제작합니다(실제 디즈니 캐릭터 미사용).
