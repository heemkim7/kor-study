# 공주/일러스트 AI 생성 프롬프트 팩

> **현재 상태:** 앱의 공주 꾸미기·장면 그림은 전부 **손으로 만든 벡터(SVG)** 입니다.
> 옷·머리·왕관·배경·아이템을 **실시간으로 갈아입고**(480+조합) **비용 0**입니다.
> → 그래서 "갈아입기"용으로 AI 그림을 따로 만들 필요는 이제 없습니다.
>
> AI 그림이 빛나는 곳은 **① 시작 화면(스플래시) ② 홈 대표 그림 ③ 레슨 표지 ④ 아이콘·마케팅** 입니다.
> 아래 프롬프트를 **브라우저에서 로그인해 쓰는 무료 AI**(ChatGPT·Gemini·Microsoft Copilot 이미지)에
> 붙여넣어 직접 만들면 됩니다. **API 비용 0.**

## 꼭 지킬 것
- **우리만의 오리지널 캐릭터.** 디즈니/엘사/특정 캐릭터 이름 금지(판매 시 저작권). "디즈니풍"까지만.
- 배경 **투명(transparent PNG)** 으로 요청 → 앱에 얹기 쉬움.
- 여러 장을 같은 그림체로: **같은 스타일 문장 + 같은 시드/참조 이미지** 사용.
- 아이용이라 **밝고 둥글둥글, 무섭지 않게.**

## 0) 마스터 스타일 문장 (모든 프롬프트 앞에 붙이기)
```
Cute kawaii children's storybook illustration, soft flat vector style, rounded shapes,
pastel colors, thick clean outlines, simple shading, big friendly eyes, wholesome and cozy,
no text, no watermark, ORIGINAL character (not based on any existing franchise),
transparent background, centered, high quality.
```

## 1) 주인공 공주 — 히어로/스플래시
```
<마스터 스타일 문장>
A sweet little princess girl about 4 years old, full body, standing and smiling,
long wavy blonde hair, small gold tiara, puffy pink ball gown with white trim,
rosy cheeks, hands gently together. Portrait 3:4.
```
> 저장: `princess-hero.png` (세로, 투명). 드레스/머리/왕관 색을 바꿔 여러 버전도 OK.

## 2) 레슨 표지 6장 (선택 — 지금 벡터 표지를 더 화려하게)
각 줄 앞에 마스터 스타일 문장. 가로 4:3 권장.
1. 과일나라 — `a brown teddy bear and friends on a fruit picnic with apples bananas grapes, sunny meadow`
2. 동물 친구들 — `a brown teddy bear playing with a puppy, kitten and bunny in a green forest`
3. 반짝 밤하늘 — `a brown teddy bear under a starry night sky with a big round moon and glowing flowers`
4. 붕붕 탈것 — `a cute red car, a yellow school bus and a little steam train on a sunny road, toy style`
5. 알록달록 색깔 — `a teddy bear holding red, blue and yellow balloons, bright cheerful colors`
6. 우리 가족 — `a happy bear family: mommy bear with a bow, daddy bear with glasses, baby bear, cozy house`

## 3) 앱 아이콘 / 마케팅 (선택)
```
<마스터 스타일 문장>
App icon, a cute princess face with a tiny crown beside a big hangul letter '가',
on a soft pink rounded square, bold and simple.
```

## 앱에 넣는 법
- 받은 PNG를 `public/img/ai/` 에 넣고 파일명을 알려주세요 → 제가 스플래시/홈/표지에 연결합니다.
- 꾸미기 인형 자체는 **지금처럼 벡터**가 갈아입기·비용 면에서 가장 좋습니다(바꾸지 않는 걸 추천).

---

## (고급·선택) 옵션 B — AI 레이어로 꾸미기 인형을 통째로 교체하고 싶다면
지금 벡터 인형 대신 **AI 그림으로 갈아입기**를 하려면, 모든 조각을 **똑같은 베이스 위에 입힌 채** 생성해
오려내야 정렬이 맞습니다(품질↑, 손은 많이 감). 핵심만:
- **고정 베이스 1장**을 먼저 만들고, 편집 가능한 AI(ChatGPT/Gemini 이미지 편집)에 업로드 →
  `"Keep this exact girl identical — same face, body, pose, size, position; only ADD/REPLACE [ITEM]"`.
- 모든 컷 **동일 포즈·크기·정면·연한 민트 단색 배경·3:4**.
- 슬롯: 헤어 / 원피스 / 상의 / 하의 / 신발 / 머리악세 / 목·손악세 / 등(날개·망토) / 배경.
- z-order: `배경 → 등 → 몸 → 하의 → 상의·원피스 → 신발 → 헤어 → 머리악세 → 목·손악세`.
- 샘플 2~3개로 정렬을 먼저 확인하고 확장하세요. 만든 PNG를 주시면 제가 오려내기·정렬·연결합니다.
> 단, 이 방식은 손이 많이 가고 벡터보다 느립니다. **대부분은 옵션 B 없이도 충분히 예쁩니다.**
