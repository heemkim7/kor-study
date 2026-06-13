# 이야기 장면 일러스트 — AI 프롬프트 팩 (선택 업그레이드)

> **현재 상태:** 6장면은 이미 **벡터(SVG) 그림책 일러스트**로 완성되어 앱에 들어가 있습니다
> (`public/img/scene/*.svg`, 생성기 `scripts/gen-scene-art.mjs`). 비용 0·오프라인·태블릿에서 선명.
> 이 문서는 **나중에 더 회화적/3D 느낌의 고화질로 바꾸고 싶을 때만** 쓰는 선택 사항이에요.
> (공주 프롬프트 팩과 동일한 방식 — 브라우저 로그인 AI로 빌드 타임에 1회 생성)

## 공통 스타일 앵커 (6장 모두 동일하게 붙이기)

```
Style: warm, cozy children's picture-book illustration for toddlers (age 3–5),
soft rounded 3D-ish shapes with gentle soft lighting, flat-friendly but plush look,
clean and modern, NOT photorealistic, NO text, NO letters.
Palette: cream/peach background warmth, soft sky blue, fresh green grass,
warm orange & soft pink accents (match a cozy cream app theme).
Aspect ratio 4:3, centered composition, lots of soft negative space at top.
Original characters (do NOT copy any existing franchise/Disney characters).
```

## 캐스트 (모든 장면에서 동일하게 묘사해 일관성 유지)

- **곰돌이(Bear) — 주인공:** chubby light-brown teddy bear, round head, rounded ears,
  cream muzzle & belly, tiny dark eyes, rosy cheeks, gentle smile. Cute and friendly.
- **원숭이(Monkey):** small brown monkey, heart-shaped tan face, round side ears, long curly tail, cheerful.
- **다람쥐(Squirrel):** orange-brown squirrel, big fluffy curled tail, tiny pointed ears, holding things with both paws.
- **토끼(Rabbit):** cream-white bunny, long upright ears with soft-pink inner, tiny pink nose, rosy cheeks.

## 장면별 프롬프트 (파일명 = sceneImage 값)

### 1. `picnic` — 소풍 출발
```
곰돌이 bear and the cream-white rabbit happily walking along a gentle winding dirt path
toward a sunny "fruit land", carrying a small picnic basket. Rolling green hills,
two small apple trees in the distance, bright sun, fluffy clouds, flowers and a butterfly. Joyful morning mood.
```

### 2. `orchard` — 빨간 사과 따기
```
곰돌이 bear standing in an apple orchard, one arm raised holding a big shiny red apple,
delighted expression. Two leafy apple trees full of red apples, a wooden basket of apples on the grass,
sunny sky, flowers, a butterfly. Bright cheerful mood.
```

### 3. `monkey` — 원숭이가 바나나를 건넴
```
A cheerful monkey sitting on a tree branch, smiling, reaching down to hand a ripe yellow banana
to 곰돌이 bear who looks up happily from the grass below. Big leafy tree with bananas,
sunny sky, soft clouds. Warm friendly mood.
```

### 4. `squirrel` — 다람쥐가 포도를 가져옴
```
A squirrel with a big fluffy tail hopping happily while holding a bunch of purple grapes in both paws,
bringing them to 곰돌이 bear. Green grass, a small tree, a tiny red mushroom accent, sunny sky, a butterfly. Playful mood.
```

### 5. `share` — 셋이 나눠 먹기
```
곰돌이 bear, the monkey, and the squirrel sitting together around a checkered picnic blanket,
sharing a red apple, a yellow banana and purple grapes laid in the middle. All smiling happily ("냠냠"),
sunny sky, flowers. Warm, friendly, heart-warming mood.
```

### 6. `bye` — 노을 속 작별 인사
```
곰돌이 bear, monkey, squirrel and the cream-white rabbit standing together waving goodbye,
warm sunset sky (peach to soft pink), low glowing sun, gentle hills, a few soft stars.
Cozy, happy "see you tomorrow" farewell mood.
```

## 적용 방법

1. 위 **공통 스타일 앵커 + 캐스트 + 해당 장면 프롬프트**를 합쳐 한 번에 생성(4:3).
2. 6장을 각각 저장.
3. 둘 중 하나로 교체:
   - **간단(권장):** `public/img/scene/<id>.png` 로 저장하고
     `src/story/StoryPlayer.tsx` 의 확장자를 `.svg` → `.png` 로 변경.
   - 또는 SVG로 받았다면 `public/img/scene/<id>.svg` 를 덮어쓰기(코드 변경 불필요).
4. `npm run build` 로 PWA 프리캐시에 자동 포함됨(글롭에 png·svg 모두 포함).

> 캐릭터를 매번 동일하게 묘사해야 6장면 사이에서 곰돌이가 같은 캐릭터로 보입니다.
> 한 장을 먼저 마음에 들게 뽑은 뒤, 그 이미지를 레퍼런스로 "same bear/monkey/squirrel, new scene" 식으로 이어 생성하면 일관성이 좋아집니다.
