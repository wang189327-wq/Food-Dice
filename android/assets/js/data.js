import { PRESET_DISHES, CATEGORY_ORDER, EXTRA_DISHES, PRESET_SHOPS, PRESET_RECIPES, PRESET_BY_NAME } from './seed-data.js';
import { APP_VERSION } from './version.js';
const $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
  }[c]));
const fresh = () => ({
  schema: 1,
  categories: [
    '小炒菜',
    '凉菜',
    '高蛋白',
    '减脂菜',
    '炖汤',
    '主食'
  ],
  dishes: [],
  plans: {},
  takeouts: []
});
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const dateString = d => `${ d.getFullYear() }-${ String(d.getMonth() + 1).padStart(2, '0') }-${ String(d.getDate()).padStart(2, '0') }`;
const today = () => dateString(new Date()), fmt = n => n == null ? '未填写' : Number(n.toFixed(1)).toString();
const options = (items, selected = '') => items.map(c => `<option value="${ esc(c) }" ${ c === selected ? 'selected' : '' }>${ esc(c) }</option>`).join('');
function toLocalPhoto(src) {
  const prefix = 'https://menu.local/photos/';
  return src.startsWith(prefix) ? 'photos/' + src.slice(prefix.length) : src;
}
function displayImage(src) {
  if (!src || src.startsWith('data:')) return src;
  const local = toLocalPhoto(src);
  if (!APP_VERSION.bundledPhotos) return local;
  const filename = src.startsWith('https://menu.local/photos/') ? src.split('/').pop() : null;
  return filename && APP_VERSION.bundledPhotos.includes(filename)
    ? local : 'photos/placeholder.svg';
}
function photoTag(src, name, cls = 'dish-image') {
  src = displayImage(src);
  return src ? `<img class="${ cls }" src="${ esc(src) }" alt="${ esc(name) }" loading="lazy">` : `<div class="${ cls } no-photo" role="img" aria-label="尚未添加图片" style="display:grid;place-items:center;font-size:30px">🍽️</div>`;
}
function randomIndex(n) {
  if (n < 1)
    throw Error('没有候选菜品');
  if (globalThis.crypto?.getRandomValues) {
    const a = new Uint32Array(1), limit = Math.floor(4294967296 / n) * n;
    do {
      crypto.getRandomValues(a);
    } while (a[0] >= limit);
    return a[0] % n;
  }
  return Math.floor(Math.random() * n);
}
function nutrition(d) {
  return `<div class="nutrition"><span><b>${ fmt(d.calories) }</b> <small>千卡</small></span><span><b>${ fmt(d.fiber) }</b> <small>克膳食纤维</small></span></div>`;
}
const numberInput = id => $(id).value.trim() === '' ? null : Number($(id).value);
let toastTimer;
function toast(s) {
  $('toast').textContent = s;
  $('toast').style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').style.display = 'none', 3500);
}
export { displayImage, $, CATEGORY_ORDER, EXTRA_DISHES, PRESET_BY_NAME, PRESET_DISHES, PRESET_RECIPES, PRESET_SHOPS, dateString, esc, fmt, fresh, numberInput, nutrition, options, photoTag, randomIndex, toast, today, uid };

