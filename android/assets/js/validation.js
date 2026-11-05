import { dateString } from './data.js';

function optionalNumber(n, max) {
  return n === null || n === undefined || Number.isFinite(n) && n >= 0 && n <= max;
}
function validate(x) {
  if (!x || x.schema !== 1 || !Array.isArray(x.categories) || !Array.isArray(x.dishes) || !x.plans || typeof x.plans !== 'object' || Array.isArray(x.plans))
    throw Error('备份格式错误');
  if (x.categories.length > 100 || x.dishes.length > 10000 || Object.keys(x.plans).length > 10000)
    throw Error('备份过大');
  if (x.categories.some(c => typeof c !== 'string' || !c.trim() || c.length > 24) || new Set(x.categories).size !== x.categories.length)
    throw Error('分类无效');
  const ids = new Set(), takeoutIds = new Set();
  for (const d of x.dishes) {
    if (!d || typeof d.id !== 'string' || ids.has(d.id) || typeof d.name !== 'string' || !d.name.trim() || d.name.length > 60 || !x.categories.includes(d.category) || !optionalNumber(d.calories, 10000) || !optionalNumber(d.fiber, 100) || d.image && !validImage(d.image) || d.recipe !== undefined && (typeof d.recipe !== 'string' || d.recipe.length > 12000))
      throw Error('菜品数据无效');
    ids.add(d.id);
  }
  if (x.takeouts !== undefined) {
    if (!Array.isArray(x.takeouts) || x.takeouts.length > 300)
      throw Error('外卖记录过多');
    for (const t of x.takeouts) {
      if (!t || typeof t.id !== 'string' || takeoutIds.has(t.id) || typeof t.shop !== 'string' || typeof t.dish !== 'string' || !(t.shop.trim() || t.dish.trim()) || t.shop.length > 60 || t.dish.length > 80 || !optionalNumber(t.price, 99999) || !optionalNumber(t.calories, 10000) || t.image && !validImage(t.image))
        throw Error('外卖数据无效');
      takeoutIds.add(t.id);
    }
  }
  for (const [day, p] of Object.entries(x.plans)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || dateString(new Date(day + 'T12:00:00')) !== day || !p || typeof p !== 'object' || Object.keys(p).some(k => ![
        'lunch',
        'dinner'
      ].includes(k)))
      throw Error('日期或餐次无效');
    for (const list of Object.values(p)) {
      if (!Array.isArray(list) || list.length > 100)
        throw Error('计划过多');
      for (const i of list) {
        if (!i || !Number.isFinite(i.grams) || i.grams < 1 || i.grams > 10000)
          throw Error('计划重量无效');
        if (i.source === 'takeout') {
          if (!takeoutIds.has(i.dishId) || !Number.isFinite(i.servings) || i.servings <= 0 || i.servings > 100)
            throw Error('外卖计划无效');
        } else if (i.source && i.source !== 'dish' || !ids.has(i.dishId))
          throw Error('计划菜品无效');
      }
    }
  }
  return x;
}
function validImage(v) {
  return typeof v === 'string' && v.length < 210000 && (/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v) || /^https:\/\/menu\.local\/photos\/(?:preset-20261020-\d{3}|staple-20261020-\d{2}|store-20261020-\d{2})\.jpg$/.test(v));
}

export { optionalNumber, validImage, validate };
