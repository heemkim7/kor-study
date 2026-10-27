"""제미나이 인형(녹색 배경) → 투명 webp. 사용: python scripts/cut-princess-dress.py in.png out.webp
1) 모서리 색으로 가장자리 floodfill(전역 매칭은 드레스 하이라이트에 구멍을 냄)  2) 녹색 번짐 제거
3) 가장 큰 덩어리만 남김(제미나이 별 마크 등 떨어진 조각 제거)  4) 모든 드레스 공통 프레임으로 자르고 400px 폭 webp."""
import subprocess, sys, tempfile, os
import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
tmp = os.path.join(tempfile.gettempdir(), 'cut-tmp.png')
c = subprocess.check_output(['magick', src, '-crop', '40x40+6+6', '+repage', '-resize', '1x1!', '-format', '#%[hex:u.p{0,0}]', 'info:']).decode()[:7]
subprocess.check_call(['magick', src, '-alpha', 'set', '-bordercolor', c, '-border', '1', '-fuzz', os.environ.get('CUT_FUZZ', '18%'), '-fill', 'none',
    '-draw', 'color 0,0 floodfill', '-shave', '1x1', '-channel', 'G', '-fx', 'min(g,(r+b)/2+0.12)', '+channel', tmp])
im = np.array(Image.open(tmp).convert('RGBA'))
lab, n = ndimage.label(im[..., 3] > 8)
if n > 1:
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    im[..., 3] = np.where(lab == (1 + int(np.argmax(sizes))), im[..., 3], 0)
img = Image.fromarray(im).crop((80, 184, 820, 1104))
img = img.resize((400, round(400 * 920 / 740)), Image.LANCZOS)
img.save(dst, 'WEBP', quality=88, alpha_quality=95)
