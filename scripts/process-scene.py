"""제미나이 동화 장면 캡처(1025x763) → public/img/scene/<id>.webp (960x720).
우하단의 제미나이 별 마크(반투명 마름모)는 마스크 인페인팅으로 지운다. 사용: python scripts/process-scene.py in.png out.webp"""
import sys
import cv2
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src)
h, w = im.shape[:2]
sx, sy = w / 1025, h / 763
mask = np.zeros((h, w), np.uint8)
cv2.rectangle(mask, (int(906 * sx), int(641 * sy)), (int(944 * sx), int(683 * sy)), 255, -1)
im = cv2.inpaint(im, mask, 3, cv2.INPAINT_TELEA)
im = cv2.resize(im, (960, 720), interpolation=cv2.INTER_AREA)
cv2.imwrite(dst, im, [cv2.IMWRITE_WEBP_QUALITY, 86])
