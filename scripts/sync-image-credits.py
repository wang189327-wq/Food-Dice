"""Regenerate the app and Markdown credits from the reviewed JSON manifest."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
credits = json.loads((ROOT / 'docs/image-attributions.json').read_text(encoding='utf-8'))
module = 'const PHOTO_CREDITS = ' + json.dumps(credits, ensure_ascii=False, indent=2) + ';\nexport { PHOTO_CREDITS };\n'
(ROOT / 'android/assets/js/asset-credits.js').write_text(module, encoding='utf-8', newline='\n')
lines = [
    '# 图片来源与许可', '',
    '代码采用MIT；下列摄影图片分别按原许可证提供，裁剪版本沿用该图许可证。',
    '菜品与餐厅配图为示意图，不代表摄影者或品牌背书。餐厅图为品类示意，并非指定门店实拍。',
    '作者、原图页、许可证链接及处理方式也可在应用设置的“图片来源与许可”查看。', ''
]
for credit in credits:
    lines.extend([
        '## ' + credit['name'], '',
        '- 文件：`' + credit['file'] + '`',
        '- 图片：' + credit['title'],
        '- 作者：' + credit['author'],
        '- 来源：[' + credit['title'] + '](' + credit['sourcePage'] + ')',
        '- 许可：[' + credit['license'] + '](' + credit['licenseUrl'] + ')',
        '- 修改：' + credit['changes'], ''
    ])
(ROOT / 'docs/IMAGE_CREDITS.md').write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8', newline='\n')
print('Updated credits for', len(credits), 'bundled images.')
