"""제미나이 동화 장면 캡처(1025x763) → public/img/scene/<id>.webp (960x720).
우하단의 제미나이 별 마크(반투명 마름모)는 마스크 인페인팅으로 지운다. 사용: python scripts/process-scene.py in.png out.webp [clean]
다운로드 원본(별 마크 없음)은 세 번째 인자 clean으로 인페인팅을 건너뛴다."""
import sys
import cv2
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src)
h, w = im.shape[:2]
sx, sy = w / 1025, h / 763
mask = np.zeros((h, w), np.uint8)
cv2.rectangle(mask, (int(906 * sx), int(641 * sy)), (int(944 * sx), int(683 * sy)), 255, -1)
if not (len(sys.argv) > 3 and sys.argv[3] == 'clean'):
    im = cv2.inpaint(im, mask, 3, cv2.INPAINT_TELEA)
# 수채화 종이 여백(밝은 테두리)이 생긴 경우 안쪽으로 잘라낸다
m = max(2, int(min(h, w) * 0.012))
if im[:m].mean() > 215 or im[-m:].mean() > 215 or im[:, :m].mean() > 215 or im[:, -m:].mean() > 215:
    cy, cx = int(h * 0.03), int(w * 0.03)
    im = im[cy:h - cy, cx:w - cx]
im = cv2.resize(im, (960, 720), interpolation=cv2.INTER_AREA)
cv2.imwrite(dst, im, [cv2.IMWRITE_WEBP_QUALITY, 86])
