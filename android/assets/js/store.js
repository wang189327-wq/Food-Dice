import { EXTRA_DISHES, PRESET_DISHES, PRESET_RECIPES, PRESET_SHOPS, fresh, toast } from './data.js';
import { validate } from './validation.js';

let data = fresh(), storageBroken = false;
try {
  const raw = window.Native ? Native.load() : localStorage.getItem('menu-data');
  if (raw)
    data = validate(JSON.parse(raw));
} catch (e) {
  storageBroken = true;
  setTimeout(() => alert('已有数据读取失败，已停止写入以保护原数据。请在设置中恢复有效备份。'), 100);
}
function save() {
  if (storageBroken) {
    toast('数据读取异常，请先恢复有效备份');
    return false;
  }
  try {
    const s = JSON.stringify(data);
    if (window.Native) {
      if (!Native.save(s))
        throw Error('写入失败');
    } else
      localStorage.setItem('menu-data', s);
    return true;
  } catch (e) {
    toast('保存失败，请勿退出应用：' + e.message);
    return false;
  }
}
const listeners = new Set();
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function commit(next) {
  try { validate(next); }
  catch (error) { toast('数据未保存：' + error.message); return false; }
  const previous = data;
  data = next;
  if (!save()) {
    data = previous;
    return false;
  }
  for (const listener of listeners) listener();
  return true;
}
function mutate(fn) {
  const next = JSON.parse(JSON.stringify(data));
  fn(next);
  return commit(next);
}
function seedPresets() {
  if (storageBroken || data.seedVersion === 1)
    return;
  const next = JSON.parse(JSON.stringify(data));
  for (const c of [
      '小炒菜',
      '凉菜',
      '高蛋白',
      '减脂菜',
      '炖汤',
      '主食'
    ])
    if (!next.categories.includes(c))
      next.categories.push(c);
  for (const preset of PRESET_DISHES) {
    const existing = next.dishes.find(d => d.name.trim() === preset.name);
    if (existing) {
      existing.category = preset.category;
    } else
      next.dishes.push({ ...preset });
  }
  next.categories = next.categories.filter(c => ![
    '荤菜',
    '素菜',
    '汤羹'
  ].includes(c) || next.dishes.some(d => d.category === c));
  next.seedVersion = 1;
  try {
    validate(next);
    commit(next);
  } catch (e) {
    toast('预置菜谱写入失败：' + e.message);
  }
}
function ensureStarterCatalog() {
  if (storageBroken || data.menu130)
    return;
  const next = JSON.parse(JSON.stringify(data));
  for (const preset of EXTRA_DISHES) {
    if (!next.categories.includes(preset.category))
      next.categories.push(preset.category);
    if (!next.dishes.some(d => d.name.trim() === preset.name))
      next.dishes.push({ ...preset });
  }
  for (const d of next.dishes)
    if (d.recipe === undefined && PRESET_RECIPES[d.name])
      d.recipe = PRESET_RECIPES[d.name];
  next.takeouts ??= [];
  for (const t of PRESET_SHOPS)
    if (!next.takeouts.some(x => x.shop === t.shop))
      next.takeouts.push({ ...t });
  next.menu130 = true;
  try {
    validate(next);
    commit(next);
  } catch (e) {
    toast('新版数据补充失败：' + e.message);
  }
}

function restoreBackup(next) {
  const wasBroken = storageBroken;
  storageBroken = false;
  const saved = commit(next);
  if (!saved) storageBroken = wasBroken;
  return saved;
}

export { subscribe, data, ensureStarterCatalog, mutate, restoreBackup, seedPresets };
