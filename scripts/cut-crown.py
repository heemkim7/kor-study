"""왕관/소품 캡처(녹색 배경) → 트림된 투명 webp. 사용: python scripts/cut-crown.py in.png out.webp
가장자리 UI 아이콘·제미나이 별 마크는 중앙 크롭으로 제거."""
import subprocess, sys, tempfile, os
import numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
tmp = os.path.join(tempfile.gettempdir(), 'crown-tmp.png')
subprocess.check_call(['magick', src, '-crop', '540x330+85+25', '+repage', tmp])
c = subprocess.check_output(['magick', tmp, '-crop', '30x30+4+4', '+repage', '-resize', '1x1!', '-format', '#%[hex:u.p{0,0}]', 'info:']).decode()[:7]
# 왕관은 안쪽에 막힌 틈이 있어 가장자리 floodfill로는 못 지움 → 배경색 전역 제거(소품에 배경과 비슷한 색이 없을 때만 안전).
subprocess.check_call(['magick', tmp, '-alpha', 'set', '-fuzz', os.environ.get('CUT_FUZZ', '22%'), '-transparent', c,
    '-channel', 'G', '-fx', 'min(g,(r+b)/2+0.12)', '+channel', tmp])
im = np.array(Image.open(tmp).convert('RGBA'))
lab, n = ndimage.label(im[..., 3] > 8)
if n > 1:
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    im[..., 3] = np.where(lab == (1 + int(np.argmax(sizes))), im[..., 3], 0)
img = Image.fromarray(im); img = img.crop(img.getbbox())
img = img.resize((300, round(300 * img.height / img.width)), Image.LANCZOS)
img.save(dst, 'WEBP', quality=90, alpha_quality=95)
