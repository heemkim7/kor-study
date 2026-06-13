# 공주 이미지 생성 프롬프트 팩 (Model B — 레이어 믹스매치)

> 헤어·옷·신발·악세를 **따로** 모아 자유 조합하는 방식. 무료 브라우저 AI(Microsoft 코파일럿/Bing,
> Google Gemini, ChatGPT 등)로 생성. 영어 프롬프트가 품질이 가장 좋습니다.
> 생성한 PNG를 주시면 배경 투명 처리·오려내기·정렬·파일명 정리 후 앱에 넣습니다.

## ⚠️ 시작 전 꼭
- **오리지널 캐릭터.** 실제 디즈니 공주/이름 금지(판매 시 침해). 클래식 금발 디즈니'풍'까지만.
- **핵심 = 고정 베이스.** 먼저 베이스 공주 1장을 만들고, 모든 아이템을 **그 베이스 위에 입힌 상태로** 생성한 뒤
  그 조각만 투명하게 오려냅니다. 그래야 헤어만/옷만/신발만 바꿔도 위치가 딱 맞아요.
- **편집 가능한 도구 권장**: 베이스 이미지를 업로드해 "이 아이를 그대로 두고 X만 입혀줘"가 되는 도구
  (ChatGPT 이미지 편집, Gemini 이미지 편집)가 정렬이 가장 정확. 안 되면 같은 채팅에서 이어서 생성.
- 본격 제작 전 **샘플 2~3개로 정렬 품질 먼저 확인** 후 전체 확장.

---

## 0) 고정 블록

**CHARACTER (anchor) — 베이스/아이템 모두 동일하게 유지:**
```
An original cute little-girl princess, about 6 years old, sweet round face, very large
sparkling sky-blue eyes with long eyelashes, small button nose, rosy blushed cheeks,
warm gentle smile, fair skin, classic golden-blonde hair. Adorable, Disney-inspired but
ORIGINAL — must NOT resemble any existing Disney or copyrighted princess.
```

**STYLE:**
```
Disney-inspired ORIGINAL 2D illustration, soft painterly cel-shading, smooth gradients,
clean rounded shapes, warm cozy children's storybook quality, high detail, soft even
lighting, gentle vibrant pastel palette.
```

**POSE/TECH (모든 이미지 동일 — 레이어 정렬의 핵심):**
```
Full body, head to toe fully in frame, standing upright in a neutral pose facing forward,
arms slightly away from the body with open hands, IDENTICAL pose, body shape, proportions,
size, position and camera distance in every image, plain flat solid pale mint-green
background, 3:4 portrait, centered with generous margin, no text, no watermark, no border,
no extra characters, no ground shadow.
```

---

## 1) 베이스 (딱 1장 — 가장 먼저)
```
[CHARACTER + STYLE + POSE/TECH]
Wearing a plain simple white leotard/bodysuit, barefoot, with neutral short
shoulder-length golden-blonde hair. No accessories. This is the BASE doll.
```
> 이 베이스를 저장해 두고, 아래 모든 아이템 생성의 출발 이미지로 씁니다.

**아이템 생성 지시문(편집 도구 사용 시, 베이스 업로드 후):**
```
Keep this exact girl identical — same face, same body, same pose, same size and position,
same pale mint background. Do NOT change anything except: ADD/REPLACE with [ITEM]. 
```

---

## 2) 슬롯별 아이템 (≈83개)

각 항목 = 위 지시문의 `[ITEM]`에 넣을 설명. (※ 헤어는 베이스 머리를 덮는 전체 헤어, 옷은 몸통/다리에 얹힘, 신발은 발, 악세는 고정 위치)

### 💇 헤어 (12)
```
1  Long loose golden-blonde wavy hair
2  Golden-blonde hair with a side braid over one shoulder
3  Golden-blonde twin pigtails with small ribbons
4  Golden-blonde high ponytail with a bow
5  Golden-blonde neat bun
6  Golden-blonde double braids
7  Golden-blonde short bob with bangs
8  Long straight golden-blonde hair with bangs
9  Long wavy strawberry-auburn hair (color variant)
10 Long brown braided hair (color variant)
11 Long platinum-silver wavy hair (fantasy variant)
12 Golden-blonde curly ringlets
```

### 👗 원피스/드레스 (14)  — 입으면 상의·하의 슬롯은 가려짐
```
1  Luxurious pink ball gown with puffed sleeves and ruffled skirt
2  Sparkling ice-blue winter gown with a sheer glittering cape
3  Cheerful knee-length sunny-yellow day dress with white sash
4  Dreamy lavender fairy dress with layered petal skirt
5  Shimmering teal-aqua mermaid-style gown with fishtail hem
6  Cream dress with a red hooded riding cape and brown laced bodice
7  Short mint-green spring dress with small floral print
8  Korean hanbok: soft pink jeogori with long sky-blue chima skirt
9  White sparkly snow-princess gown
10 Emerald-green royal gown with gold trim
11 Peach rose garden dress with rosette details
12 Deep-purple starry-night gown with sparkles
13 Rainbow layered tutu party dress
14 Classic pale-blue ball gown with puffed sleeves
```

### 👚 상의 (10) — 하의와 조합
```
1  White ruffled blouse
2  Pink cardigan over a white tee
3  Striped long-sleeve tee
4  Yellow polka-dot blouse
5  Denim jacket over a white top
6  Floral peasant top
7  Cozy red knit sweater
8  Sailor-collar top
9  Puff-sleeve lace top
10 Pastel hoodie
```

### 👖 하의 (10)
```
1  Pink tutu skirt
2  Denim skirt
3  Blue jeans
4  Plaid skirt
5  White pleated skirt
6  Floral leggings
7  Yellow shorts with suspenders
8  Long flowy mint maxi skirt
9  Polka-dot skirt
10 Corduroy overall skirt
```

### 👟 신발 (10)
```
1  Pink Mary-Jane shoes
2  White sneakers
3  Sparkly glass-slipper heels
4  Brown ankle boots
5  Red ballet flats
6  Yellow rain boots
7  Silver sparkly heels
8  Flower sandals
9  Fluffy winter fur boots
10 Korean traditional embroidered kkotsin
```

### 👑 머리 악세 (8) — 헤어 위에 얹힘
```
1  Dainty golden tiara with tiny gems
2  Ornate golden royal crown with jewels
3  Large soft-pink hair bow
4  Flower crown
5  Wide-brim sun hat
6  Cute animal-ear headband
7  Winter earmuffs
8  Star-shaped hairpin
```

### 📿 목·손 악세 (7)
```
1  Necklace with a heart-shaped pink gem
2  Pearl necklace
3  Magic wand with a glowing star topper
4  Small pink handbag (held)
5  White gloves
6  Flower bouquet (held)
7  Butterfly bracelet
```

### 🧚 등 — 날개·망토 (4) — 몸 뒤에 깔림
```
1  Translucent iridescent fairy wings
2  Colorful butterfly wings
3  Royal red velvet cape
4  White angel feather wings
```

### 🌈 배경 (8) — 공주 뒤 장면 (별도, 캐릭터 없이)
공통: `A children's storybook background, Disney-inspired soft painterly 2D, dreamy and warm, NO characters, NO text, clear lower-center area for a standing princess, 3:4 portrait.`
```
1  Grand castle ballroom with chandeliers
2  Sunny enchanted flower garden with butterflies
3  Magical starry night sky with a big moon
4  Cute theater stage with a warm spotlight and confetti
5  Cozy pastel bedroom
6  Sparkling magic forest
7  Sunny seaside beach
8  Snowy winter wonderland
```

---

## 3) 레이어 순서 (앱이 겹치는 순서, z-order)
```
배경 → 등(날개/망토) → 베이스 몸 → 하의 → 상의 또는 원피스 → 신발 → 헤어 → 머리악세 → 목·손악세
```
※ 원피스를 입으면 상의·하의는 숨김.

## 4) 합계 & 시작 권장
| 슬롯 | 개수 |  | 슬롯 | 개수 |
|---|---|---|---|---|
| 헤어 | 12 | | 머리악세 | 8 |
| 원피스/드레스 | 14 | | 목·손악세 | 7 |
| 상의 | 10 | | 등(날개·망토) | 4 |
| 하의 | 10 | | 배경 | 8 |
| 신발 | 10 | | **합계** | **≈ 83** |

> 한 번에 다 만들 필요 없음. **베이스 1 + 헤어 2 + 원피스 2 + 신발 2 + 머리악세 2 + 배경 1**(≈10장)로
> 먼저 정렬·품질 확인 → 좋으면 나머지로 확장.

## 5) 저장 파일명 규칙 (제가 정리)
```
base/base.png
hair/hair-01-long-wave.png      dress/dress-01-pink-gown.png    top/top-01-white-blouse.png
bottom/bottom-01-tutu.png       shoes/shoes-01-maryjane.png     head/head-01-tiara.png
neckhand/nh-01-heart-necklace.png   back/back-01-fairy-wings.png   background/bg-01-castle.png
```
