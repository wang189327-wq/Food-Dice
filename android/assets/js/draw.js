import { data } from './store.js';
import { $, esc, fmt, nutrition, photoTag, randomIndex, toast, today } from './data.js';
import { categoryOrder } from './catalog.js';
import { dishPhoto } from './catalog-view.js';
import { openMeal } from './planner.js';

let chosen = new Set();
let drawTakeout = false, drawSelection = null;
function renderDraw() {
  chosen = new Set([...chosen].filter(c => data.categories.includes(c)));
  $('drawCategories').innerHTML = categoryOrder().map(c => `<label><input type="checkbox" value="${ esc(c) }" ${ chosen.has(c) ? 'checked' : '' }>${ esc(c) } <small>${ data.dishes.filter(d => d.category === c).length }</small></label>`).join('') + `<label class="takeout-choice"><input type="checkbox" value="__takeout__" ${ drawTakeout ? 'checked' : '' }>外卖 <small>${ (data.takeouts || []).length }</small></label>`;
}
$('drawCategories').onchange = () => {
  chosen = new Set([...$('drawCategories').querySelectorAll('input:checked')].map(i => i.value).filter(v => v !== '__takeout__'));
  drawTakeout = !!$('drawCategories').querySelector('input[value="__takeout__"]:checked');
};
$('selectAll').onclick = () => {
  chosen = new Set(data.categories);
  drawTakeout = true;
  renderDraw();
};
$('selectNone').onclick = () => {
  chosen.clear();
  drawTakeout = false;
  renderDraw();
};
$('drawButton').onclick = () => {
  const pool = data.dishes.filter(d => chosen.has(d.category)).map(d => ({
    source: 'dish',
    item: d
  }));
  if (drawTakeout)
    pool.push(...(data.takeouts || []).map(t => ({
      source: 'takeout',
      item: t
    })));
  if (!pool.length)
    return toast('请勾选有菜品的分类或外卖');
  drawSelection = pool[randomIndex(pool.length)];
  const d = drawSelection.item, isTakeout = drawSelection.source === 'takeout';
  $('drawResult').innerHTML = `<div class="hero draw-picked"><span class="pill">抽中了 · ${ isTakeout ? '外卖' : esc(d.category) }</span>${ photoTag(isTakeout ? d.image : dishPhoto(d), isTakeout ? d.shop || d.dish : d.name, 'draw-image') }<h2>${ esc(isTakeout ? d.shop || d.dish : d.name) }</h2>${ isTakeout ? `<p>${ esc(d.shop ? d.dish : '') }</p><div class="stats">${ d.calories == null ? '卡路里未填写' : fmt(d.calories) + ' 千卡 / 份' }${ d.price == null ? '' : ' · ¥' + d.price.toFixed(2) }</div>` : nutrition(d) }<label class="draw-date-label">安排日期<input id="drawDate" type="date" value="${ $('planDate').value || today() }" required></label><div class="row" style="justify-content:center"><button data-draw-meal="lunch">加入午餐</button><button data-draw-meal="dinner">加入晚餐</button></div></div>`;
};
$('drawResult').onclick = e => {
  const b = e.target.closest('[data-draw-meal]');
  if (!b || !drawSelection)
    return;
  const day = $('drawDate').value;
  if (!day)
    return toast('请选择日期');
  openMeal(b.dataset.drawMeal, drawSelection.item.id, day, drawSelection.source);
};

function initializeDraw() { chosen = new Set(data.categories); }

export { initializeDraw, renderDraw };
