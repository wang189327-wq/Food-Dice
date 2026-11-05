import { $, dateString, esc, fmt, toast, today } from './data.js';
import { data, mutate } from './store.js';

$('planDate').onchange = renderPlan;
$('mealSlots').onclick = e => {
  const b = e.target.closest('button');
  if (!b)
    return;
  if (b.dataset.addMeal)
    openMeal(b.dataset.addMeal);
  if (b.dataset.removeMeal) {
    const [type, n] = b.dataset.removeMeal.split(':');
    mutate(x => x.plans[$('planDate').value][type].splice(Number(n), 1));
  }
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-date]');
  if (b) {
    $('planDate').value = b.dataset.date;
    renderPlan();
  }
});
let indexedData = null;
let dishesById = new Map();
let takeoutsById = new Map();
function planItem(item) {
  if (indexedData !== data) {
    dishesById = new Map(data.dishes.map(dish => [dish.id, dish]));
    takeoutsById = new Map((data.takeouts || []).map(takeout => [takeout.id, takeout]));
    indexedData = data;
  }
  return (item.source === 'takeout' ? takeoutsById : dishesById).get(item.dishId);
}
function total(items) {
  return items.reduce((a, i) => {
    const d = planItem(i);
    if (d) {
      const factor = i.source === 'takeout' ? i.servings || 1 : i.grams / 100;
      if (d.calories == null)
        a.missingCalories++;
      else
        a.calories += d.calories * factor;
      if (i.source === 'takeout' || d.fiber == null)
        a.missingFiber++;
      else
        a.fiber += d.fiber * factor;
    }
    return a;
  }, {
    calories: 0,
    fiber: 0,
    missingCalories: 0,
    missingFiber: 0
  });
}
function totalText(t) {
  return `${ t.missingCalories ? '已知' : '' }热量 ${ fmt(t.calories) } 千卡 · ${ t.missingFiber ? '已知' : '' }膳食纤维 ${ fmt(t.fiber) } 克${ t.missingCalories || t.missingFiber ? '（部分营养未填写）' : '' }`;
}
function renderPlan() {
  const day = $('planDate').value || today();
  $('planDate').value = day;
  const plan = data.plans[day] || {};
  let all = [];
  $('mealSlots').innerHTML = [
    'lunch',
    'dinner'
  ].map(type => {
    const list = plan[type] || [];
    all.push(...list);
    return `<div class="card"><div class="row between"><h2>${ type === 'lunch' ? '☀️ 午餐' : '🌙 晚餐' }</h2><button data-add-meal="${ type }">＋ 添加菜品</button></div>${ list.length ? list.map((i, n) => {
      const d = planItem(i), out = i.source === 'takeout';
      if (!d)
        return '';
      return `<div class="slot"><div class="row between"><strong>${ esc(out ? '外卖 · ' + (d.shop || d.dish) : d.name) } · ${ out ? (i.servings || 1) + '份' : i.grams + '克' }</strong><button class="danger" data-remove-meal="${ type }:${ n }">移除</button></div><small>${ totalText(total([i])) }</small></div>`;
    }).join('') : '<div class="empty">这一餐还没安排</div>' }<div class="total">本餐：${ totalText(total(list)) }</div></div>`;
  }).join('');
  $('dayTotal').textContent = '午晚餐合计：' + totalText(total(all));
  $('scheduled').innerHTML = Object.keys(data.plans).filter(day => Object.values(data.plans[day]).some(x => x.length)).sort().map(day => `<button class="secondary" data-date="${ day }" style="margin:4px">${ day }</button>`).join('') || '<p class="note">安排的日期会显示在这里。</p>';
  $('week').innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = dateString(d);
    return `<button class="secondary ${ key === day ? 'highlight' : '' }" data-date="${ key }">${ i === 0 ? '今天' : i === 1 ? '明天' : d.getMonth() + 1 + '/' + d.getDate() }</button>`;
  }).join('');
}
let selectedMealKey = '';
function fillMealOptions(query = '') {
  const q = query.trim().toLowerCase();
  const dishes = data.dishes.filter(d => (d.name + ' ' + d.category).toLowerCase().includes(q));
  const takeouts = (data.takeouts || []).filter(t => (t.shop + ' ' + t.dish).toLowerCase().includes(q));
  $('mealDish').innerHTML = (dishes.length ? '<optgroup label="我的菜谱">' + dishes.map(d => `<option value="dish:${ esc(d.id) }">${ esc(d.category + ' · ' + d.name) }</option>`).join('') + '</optgroup>' : '') + (takeouts.length ? '<optgroup label="外卖">' + takeouts.map(t => `<option value="takeout:${ esc(t.id) }">外卖 · ${ esc(t.shop || t.dish) }${ t.shop && t.dish ? ' · ' + esc(t.dish) : '' }</option>`).join('') + '</optgroup>' : '');
  if ([...$('mealDish').options].some(o => o.value === selectedMealKey))
    $('mealDish').value = selectedMealKey;
  else
    selectedMealKey = $('mealDish').value;
  updateMealUnit();
  $('mealSearchCount').textContent = '匹配 ' + (dishes.length + takeouts.length) + ' 项';
}
function updateMealUnit() {
  const out = $('mealDish').value.startsWith('takeout:');
  $('mealWeightLabel').textContent = out ? '预计份数' : '预计食用重量（克）';
  $('mealWeight').min = out ? '.1' : '1';
  $('mealWeight').max = out ? '100' : '10000';
  $('mealWeight').step = out ? '.1' : '1';
  $('mealWeight').value = out ? '1' : '100';
}
function openMeal(type, id, day, source = 'dish') {
  if (!data.dishes.length && !(data.takeouts || []).length)
    return toast('请先新增菜品或外卖');
  $('mealDate').value = day || $('planDate').value || today();
  $('mealType').value = type;
  $('mealTitle').textContent = $('mealDate').value + ' ' + (type === 'lunch' ? '午餐' : '晚餐');
  $('mealSearch').value = '';
  selectedMealKey = id ? source + ':' + id : '';
  fillMealOptions();
  $('mealDialog').showModal();
}
$('mealSearch').oninput = () => fillMealOptions($('mealSearch').value);
$('mealDish').onchange = () => {
  selectedMealKey = $('mealDish').value;
  updateMealUnit();
};
$('mealForm').onsubmit = e => {
  e.preventDefault();
  const day = $('mealDate').value, type = $('mealType').value, key = $('mealDish').value;
  if (!key)
    return toast('请先选择菜品或外卖');
  const split = key.indexOf(':'), source = key.slice(0, split), id = key.slice(split + 1), amount = Number($('mealWeight').value);
  if (!day || ![
      'lunch',
      'dinner'
    ].includes(type) || !Number.isFinite(amount) || amount < (source === 'takeout' ? 0.1 : 1) || amount > (source === 'takeout' ? 100 : 10000))
    return toast('请检查日期和用量');
  if ((data.plans[day]?.[type] || []).length >= 100)
    return toast('每餐最多100条');
  const item = source === 'takeout' ? {
    source,
    dishId: id,
    grams: 100,
    servings: amount
  } : {
    dishId: id,
    grams: amount
  };
  if (!planItem(item))
    return toast('菜品已不存在');
  if (mutate(x => {
      x.plans[day] ??= {};
      x.plans[day][type] ??= [];
      x.plans[day][type].push(item);
    })) {
    $('planDate').value = day;
    renderPlan();
    $('mealDialog').close();
    toast('已加入 ' + day + ' ' + (type === 'lunch' ? '午餐' : '晚餐'));
  }
};

export { openMeal, renderPlan, total };
