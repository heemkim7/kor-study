# 이미지 자산

## `fluent/*.png` — 단어 그림 (실제 이미지)
12개 단어 그림은 **Microsoft Fluent Emoji (3D 스타일, MIT 라이선스)** 입니다.
- 받기/갱신: `node scripts/fetch-fluent-images.mjs` (프로젝트 루트에서 실행, 인터넷 필요)
- 매핑은 `scripts/fetch-fluent-images.mjs` 의 `MAP` 참고 (예: apple ← "Red apple")
- 출처: https://github.com/microsoft/fluentui-emoji (© Microsoft, MIT)

## `scene/*.svg` — 이야기 장면 (벡터 그림책 일러스트)
모든 이야기 장면은 **손으로 만든 SVG 그림책 일러스트** 입니다.
곰돌이·원숭이·다람쥐·토끼·강아지·고양이를 재사용 부품으로 정의해 일관되게 등장시켰고,
앱 테마(코지 크림+따뜻한 톤)와 통일했습니다. 비용 0·오프라인·태블릿에서 선명.
- 과일나라: `picnic/orchard/monkey/squirrel/share/bye`
- 동물 친구들: `an-forest/an-dog/an-cat/an-rabbit/an-play/an-bye`
- 재생성/수정: `node scripts/gen-scene-art.mjs` (부품·장면 구성은 이 파일에서)
- 눈으로 확인(개발용): `node scripts/render-scenes.mjs` → `.preview/scenes/*.png` 로 PNG 렌더(@resvg/resvg-js)
- 더 회화적/3D 고화질로 바꾸려면(선택): `docs/assets/scene-image-prompts.md` 의 AI 프롬프트 팩 참고

## 새 단어 추가 시
- 흔한 사물/동물/음식이면 `scripts/fetch-fluent-images.mjs` 의 `MAP` 에 `id: '<Fluent 폴더명>'` 추가 후 재실행
- Fluent 에 없으면 `words.ts` 에서 `image: { type: 'photo', url: '...' }` 로 사진 지정
