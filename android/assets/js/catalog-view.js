import { PRESET_BY_NAME, esc, photoTag, fmt, nutrition } from './data.js';

function dishPhoto(d) {
  if (d.image)
    return d.image;
  const preset = PRESET_BY_NAME.get(d.name);
  return preset ? preset.image || 'https://menu.local/photos/' + preset.id + '.jpg' : '';
}
function dishCard(d, extraClass = '') {
  return `<article class="dish ${ extraClass }" data-open-dish="${ esc(d.id) }" role="button" tabindex="0" aria-label="查看${ esc(d.name) }详情">${ photoTag(dishPhoto(d), d.name) }<div class="dish-info"><h3>${ esc(d.name) }</h3><div class="stats">每100克${ d.estimated ? ' · 估算' : '' }<br>膳食纤维 ${ fmt(d.fiber) } 克</div><div class="energy">${ fmt(d.calories) } <small>千卡</small></div><span class="detail-link">查看做法与推荐 ›</span></div></article>`;
}

function detailCover(dish) {
  return `<div class="detail-cover">
    ${photoTag(dishPhoto(dish), dish.name, 'detail-image')}
    <button id="detailBack" class="round-back" aria-label="返回">‹</button>
    <span class="detail-category">${esc(dish.category)}</span>
  </div>`;
}
function detailSummary(dish) {
  return `<div class="detail-summary">
    <h1>${esc(dish.name)}</h1>
    <div class="stats">每100克可食部分${dish.estimated ? ' · 营养估算' : ''}</div>
    ${nutrition(dish)}
    <div class="row"><button id="detailEdit" class="secondary">编辑菜品</button>
      <button id="detailDelete" class="danger">删除菜品</button></div>
  </div>`;
}
function recommendationPanel(recommendations) {
  const cards = recommendations.map(({category, dish}) =>
    `<h3 class="recommend-category">${esc(category)}</h3>` +
    (dish ? dishCard(dish, 'recommend-card') : '<p class="note">此分类暂无其他菜品</p>')
  ).join('');
  return `<div class="detail-panel"><div class="row between"><h2>今天搭配什么</h2>
    <button id="refreshRecommendations" class="secondary">换一组 ↻</button></div>
    <p class="note">每类随机推荐一道，点击可查看详情。</p>${cards}</div>`;
}
function detailPage(dish, recipe, recommendations) {
  const recipePanel = `<div class="detail-panel"><h2>做法</h2><div class="recipe-text">${
    recipe ? esc(recipe) : '<span class="muted">暂未填写做法，可在编辑中补充。</span>'
  }</div></div>`;
  return detailCover(dish) + detailSummary(dish) + recipePanel + recommendationPanel(recommendations);
}
export { detailPage, dishCard, dishPhoto };
