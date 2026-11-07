"""把采集到的中间帧合成 README 演示动图。

依赖：Pillow（pip install pillow）。中间帧由 scripts/capture-demo.mjs 生成。

用法（在仓库根目录或任意目录均可执行）：
    npm ci && npx playwright install chromium    # 首次准备
    python -m http.server 8080 --directory android/assets
    node scripts/capture-demo.mjs                # 生成 docs/screenshots/_frames/*.png
    python scripts/build-demo-gif.py             # 合成 docs/screenshots/demo.gif

中文字体默认按常见路径自动查找，也可显式指定：
    python scripts/build-demo-gif.py --font /path/to/font.ttc
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'docs' / 'screenshots' / '_frames'
OUT = ROOT / 'docs' / 'screenshots' / 'demo.gif'

# 常见中文字体，按顺序取第一个存在的；没有则退回 Pillow 内置字体并告警
FONT_CANDIDATES = [
    'C:/Windows/Fonts/msyhbd.ttc',
    'C:/Windows/Fonts/msyh.ttc',
    '/System/Library/Fonts/PingFang.ttc',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
]

W = 260
BAR = 46
CREAM = (251, 243, 233)
INK = (58, 52, 46)


def load_font(size, explicit=None):
    if explicit:
        return ImageFont.truetype(explicit, size)
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    print('警告：未找到中文字体，标注中文可能显示为方块；用 --font 指定字体文件。', file=sys.stderr)
    try:
        return ImageFont.load_default(size)
    except TypeError:  # Pillow < 10.1 不支持指定字号
        return ImageFont.load_default()


def main():
    parser = argparse.ArgumentParser(description='合成 README 演示动图')
    parser.add_argument('--font', help='中文字体文件路径（可选）')
    parser.add_argument('--frames', help='中间帧目录（默认 docs/screenshots/_frames）')
    parser.add_argument('--out', help='输出 GIF 路径（默认 docs/screenshots/demo.gif）')
    args = parser.parse_args()

    src_dir = Path(args.frames) if args.frames else SRC
    out_path = Path(args.out) if args.out else OUT
    if not src_dir.is_dir():
        print(f'找不到中间帧目录：{src_dir}', file=sys.stderr)
        print('请先运行 node scripts/capture-demo.mjs 生成帧（需要本地 HTTP 服务）。', file=sys.stderr)
        return 1

    frames = [
        ('1-menu.png', '① 分类菜谱', 1100),
        ('2-category.png', '② 按分类筛选', 950),
        ('3-detail.png', '③ 做法与营养', 1300),
        ('4-plan.png', '④ 安排午晚餐', 1200),
        ('5-draw-top.png', '⑤ 随机抽签', 700),
    ]
    # 抽签页向下滚动：中间帧短时长形成滑动感，末帧停留供阅读
    for i in range(1, 6):
        frames.append((f'5-draw-scroll-{i}.png', '⑤ 随机抽签', 110))
    frames.append(('5-draw-scroll-6.png', '⑤ 随机抽签', 1600))
    frames.append(('7-takeout.png', '⑥ 外卖记录', 1200))

    missing = [name for name, _, _ in frames if not (src_dir / name).exists()]
    if missing:
        print('缺少以下帧：' + ', '.join(missing), file=sys.stderr)
        print('请重新运行 node scripts/capture-demo.mjs 后再合成。', file=sys.stderr)
        return 1

    font = load_font(19, args.font)
    images = []
    for name, label, ms in frames:
        src = Image.open(src_dir / name).convert('RGB')
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

    out_path.parent.mkdir(parents=True, exist_ok=True)
    pal = [im.convert('P', palette=Image.ADAPTIVE, colors=128) for im, _ in images]
    dur = [ms for _, ms in images]
    pal[0].save(out_path, save_all=True, append_images=pal[1:], duration=dur, loop=0, optimize=True, disposal=2)
    size = out_path.stat().st_size
    print('gif written:', out_path, f'{size / 1024:.0f} KB', '| frames:', len(pal), '| size:', pal[0].size)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
