"""제미나이 스프라이트 시트(녹색 배경) → 개별 투명 webp. 격자가 불규칙해도 윤곽 덩어리로 자동 분리한다.
사용: python scripts/cut-icons.py sheet.png outdir name1,name2,...  (이름은 왼쪽 위부터 행 → 열 순서. 덩어리 수와 이름 수가 같아야 함)
환경변수: CUT_FUZZ(배경 허용치, 기본 16%), GAP(덩어리를 하나로 묶는 간격 px, 기본 14), SIZE(긴 변 px, 기본 300)"""
import subprocess, sys, tempfile, os
import numpy as np
from PIL import Image
from scipy import ndimage

src, outdir, names = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
tmp = os.path.join(tempfile.gettempdir(), 'cut-icons-tmp.png')
c = subprocess.check_output(['magick', src, '-crop', '40x40+6+6', '+repage', '-resize', '1x1!', '-format', '#%[hex:u.p{0,0}]', 'info:']).decode()[:7]
subprocess.check_call(['magick', src, '-alpha', 'set', '-bordercolor', c, '-border', '1', '-fuzz', os.environ.get('CUT_FUZZ', '16%'), '-fill', 'none',
    '-draw', 'color 0,0 floodfill', '-shave', '1x1', '-channel', 'G', '-fx', 'min(g,(r+b)/2+0.10)', '+channel', tmp])
im = np.array(Image.open(tmp).convert('RGBA'))
a = im[..., 3] > 8
lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=int(os.environ.get('GAP', 14))))
sizes = ndimage.sum(a, lab, range(1, n + 1))
big = [i + 1 for i, sz in enumerate(sizes) if sz > a.sum() / (len(names) * 12)]
boxes = []
for i in big:
    ys, xs = np.where(lab == i)
    boxes.append((i, ys.min(), ys.max(), xs.min(), xs.max()))
# 행 묶기: 세로 중심이 가까우면 같은 행
boxes.sort(key=lambda b: (b[1] + b[2]) / 2)
rows, cur = [], [boxes[0]]
for b in boxes[1:]:
    if abs((b[1] + b[2]) / 2 - np.mean([(x[1] + x[2]) / 2 for x in cur])) < im.shape[0] * 0.09: cur.append(b)
    else: rows.append(cur); cur = [b]
rows.append(cur)
ordered = [b for r in rows for b in sorted(r, key=lambda b: b[3])]
print('found', len(ordered), 'expected', len(names))
os.makedirs(outdir, exist_ok=True)
for b, name in zip(ordered, names):
    i = b[0]
    keep = (lab == i) & ndimage.binary_dilation(a, iterations=1)
    cell = im.copy(); cell[..., 3] = np.where(keep, im[..., 3], 0)
    img = Image.fromarray(cell); img = img.crop(img.getbbox())
    s = int(os.environ.get('SIZE', 300)) / max(img.size)
    img = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    img.save(os.path.join(outdir, name + '.webp'), 'WEBP', quality=90, alpha_quality=95)
    print(name, img.size)
