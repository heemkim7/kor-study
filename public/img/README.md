# 이미지 자산

## `fluent/*.png` — 단어 그림 (실제 이미지)
12개 단어 그림은 **Microsoft Fluent Emoji (3D 스타일, MIT 라이선스)** 입니다.
- 받기/갱신: `node scripts/fetch-fluent-images.mjs` (프로젝트 루트에서 실행, 인터넷 필요)
- 매핑은 `scripts/fetch-fluent-images.mjs` 의 `MAP` 참고 (예: apple ← "Red apple")
- 출처: https://github.com/microsoft/fluentui-emoji (© Microsoft, MIT)

## `scene/*.png` — 이야기 장면 (임시 placeholder)
이야기 장면(orchard/monkey/squirrel)은 아직 **단색 placeholder** 입니다.
장면은 단일 이모지가 아니라 배경 일러스트가 필요해서, 추후 일러스트로 교체 예정.
- placeholder 재생성: `node scripts/gen-placeholder-images.mjs`

## 새 단어 추가 시
- 흔한 사물/동물/음식이면 `scripts/fetch-fluent-images.mjs` 의 `MAP` 에 `id: '<Fluent 폴더명>'` 추가 후 재실행
- Fluent 에 없으면 `words.ts` 에서 `image: { type: 'photo', url: '...' }` 로 사진 지정
