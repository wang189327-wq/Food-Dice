from PIL import Image, ImageDraw, ImageFont
import os

SRC = r'F:/software development/美味餐饮/GitHub开源版/docs/screenshots/_frames'
OUT = r'F:/software development/美味餐饮/GitHub开源版/docs/screenshots/demo.gif'
FONT = r'C:/Windows/Fonts/msyhbd.ttc'

W = 260
BAR = 46
CREAM = (251, 243, 233)
INK = (58, 52, 46)
ACCENT = (217, 119, 66)

frames = [
    ('1-menu.png', '① 分类菜谱', 1100),
    ('2-category.png', '② 按分类筛选', 950),
    ('3-detail.png', '③ 做法与营养', 1300),
    ('4-plan.png', '④ 安排午晚餐', 1200),
    ('6-draw-result.png', '⑤ 随机抽签', 1450),
    ('7-takeout.png', '⑥ 外卖记录', 1200),
]

font = ImageFont.truetype(FONT, 19)
images = []
for name, label, ms in frames:
    src = Image.open(os.path.join(SRC, name)).convert('RGB')
    h = round(src.height * W / src.width)
    img = src.resize((W, h), Image.LANCZOS)
    canvas = Image.new('RGB', (W, h + BAR), CREAM)
    canvas.paste(img, (0, 0))
    d = ImageDraw.Draw(canvas)
    d.line([(0, h), (W, h)], fill=(232, 221, 208), width=1)
    bbox = d.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    d.text(((W - tw) / 2, h + (BAR - (bbox[3] - bbox[1])) / 2 - bbox[1]), label, font=font, fill=INK)
    images.append((canvas, ms))

pal = [im.convert('P', palette=Image.ADAPTIVE, colors=128) for im, _ in images]
dur = [ms for _, ms in images]
pal[0].save(OUT, save_all=True, append_images=pal[1:], duration=dur, loop=0, optimize=True, disposal=2)
size = os.path.getsize(OUT)
print('gif written:', OUT, f'{size/1024:.0f} KB', '| frames:', len(pal), '| size:', pal[0].size)
