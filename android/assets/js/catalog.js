import { dishPhoto, dishCard, detailPage } from './catalog-view.js';
import { $, CATEGORY_ORDER, PRESET_BY_NAME, PRESET_RECIPES, esc, fmt, numberInput, nutrition, options, photoTag, randomIndex, toast, uid } from './data.js';
import { data, mutate } from './store.js';
import { photoState, setPreview } from './photos.js';
import { optionalNumber } from './validation.js';

let activeCategory = '小炒菜';
function categoryOrder() {
  return [
    ...CATEGORY_ORDER.filter(c => data.categories.includes(c)),
    ...data.categories.filter(c => !CATEGORY_ORDER.includes(c))
  ];
}
$('search').oninput = renderDishes;
$('filter').onchange = () => {
  activeCategory = $('filter').value;
  renderDishes();
};
$('newDish').onclick = () => openDish();
$('categoryForm').onsubmit = e => {
  e.preventDefault();
  const c = $('categoryName').value.trim();
  if (!c)
    return;
  if (data.categories.includes(c))
    return toast('此分类已存在');
  if (data.categories.length >= 100)
    return toast('最多支持100个分类');
  if (mutate(x => x.categories.push(c)))
    $('categoryName').value = '';
};
$('categoryList').onclick = e => {
  const b = e.target.closest('[data-remove-category]');
  if (!b)
    return;
  const c = data.categories[Number(b.dataset.removeCategory)];
  if (data.dishes.some(d => d.category === c))
    return toast('请先修改或删除此分类下的菜品');
  if (confirm('删除分类“' + c + '”？'))
    mutate(x => x.categories = x.categories.filter(i => i !== c));
};
$('manageCategories').onclick = () => $('categoryDialog').showModal();
function renderDishes() {
  const cats = categoryOrder(), content = document.querySelector('.catalog-content'), previous = content.scrollTop;
  if (!cats.includes(activeCategory))
    activeCategory = cats[0] || '';
  const query = $('search').value.trim().toLocaleLowerCase();
  $('filter').innerHTML = options(cats, activeCategory);
  $('categorySidebar').innerHTML = cats.map(c => `<button class="${ activeCategory === c ? 'selected' : '' }" data-category="${ esc(c) }">${ esc(c) }</button>`).join('');
  $('categoryHeading').style.display = 'none';
  $('dishList').innerHTML = cats.map((c, index) => {
    const ds = data.dishes.filter(d => d.category === c && d.name.toLocaleLowerCase().includes(query));
    return `<div class="menu-group" data-group-category="${ esc(c) }" id="menu-group-${ index }"><h3 class="group-title">${ esc(c) } <small>${ ds.length }道</small></h3>${ ds.length ? ds.map(d => dishCard(d)).join('') : '<div class="empty">暂无菜品</div>' }</div>`;
  }).join('');
  content.scrollTop = previous;
  $('categoryList').innerHTML = cats.map(c => `<span class="pill">${ esc(c) } <button class="secondary" data-remove-category="${ data.categories.indexOf(c) }" aria-label="删除${ esc(c) }分类">×</button></span>`).join('');
}
$('categorySidebar').onclick = e => {
  const b = e.target.closest('[data-category]');
  if (!b)
    return;
  activeCategory = b.dataset.category;
  if ($('search').value) {
    $('search').value = '';
    renderDishes();
  }
  const content = document.querySelector('.catalog-content'), group = [...content.querySelectorAll('[data-group-category]')].find(x => x.dataset.groupCategory === activeCategory);
  if (group)
    content.scrollTo({
      top: content.scrollTop + group.getBoundingClientRect().top - content.getBoundingClientRect().top,
      behavior: 'instant'
    });
  document.querySelectorAll('#categorySidebar button').forEach(x => x.classList.toggle('selected', x.dataset.category === activeCategory));
};
document.querySelector('.catalog-content').addEventListener('scroll', () => {
  const content = document.querySelector('.catalog-content');
  const groups = [...content.querySelectorAll('[data-group-category]')];
  let group = groups[0];
  for (const item of groups)
    if (item.getBoundingClientRect().top - content.getBoundingClientRect().top <= 44)
      group = item;
  if (group) {
    activeCategory = group.dataset.groupCategory;
    document.querySelectorAll('#categorySidebar button').forEach(x => x.classList.toggle('selected', x.dataset.category === activeCategory));
  }
});
let detailId = null, detailTrail = [], recommendationHistory = new Map();
function recipeFor(d) {
  return d.recipe ?? PRESET_RECIPES[d.name] ?? '';
}
function recommendFor(d) {
  return categoryOrder().map(c => {
    let pool = data.dishes.filter(x => x.category === c && x.id !== d.id);
    if (!pool.length)
      return {
        category: c,
        dish: null
      };
    const key = d.id + '|' + c, last = recommendationHistory.get(key);
    const next = pool.length > 1 ? pool.filter(x => x.id !== last) : pool;
    const selected = next[randomIndex(next.length)];
    recommendationHistory.set(key, selected.id);
    return {
      category: c,
      dish: selected
    };
  });
}
function openDetail(id, push = true) {
  const d = data.dishes.find(x => x.id === id);
  if (!d)
    return;
  if (push && detailId && detailId !== id && $('dishDetail').open)
    detailTrail.push(detailId);
  detailId = id;
  $('detailBody').dataset.dishId = id;
  $('detailBody').innerHTML = detailPage(d, recipeFor(d), recommendFor(d));
  if (!$('dishDetail').open)
    $('dishDetail').showModal();
  $('dishDetail').scrollTop = 0;
}
function closeDetail() {
  if (detailTrail.length) {
    const id = detailTrail.pop();
    openDetail(id, false);
  } else {
    $('dishDetail').close();
    detailId = null;
  }
}
$('dishList').onclick = e => {
  const card = e.target.closest('[data-open-dish]');
  if (card) {
    detailTrail = [];
    openDetail(card.dataset.openDish);
  }
};
$('dishDetail').onclick = e => {
  const card = e.target.closest('[data-open-dish]');
  if (card) {
    openDetail(card.dataset.openDish);
    return;
  }
  const b = e.target.closest('button');
  if (!b)
    return;
  if (b.id === 'detailBack')
    closeDetail();
  if (b.id === 'refreshRecommendations')
    openDetail(detailId, false);
  if (b.id === 'detailEdit')
    openDish(detailId);
  if (b.id === 'detailDelete')
    deleteDish(detailId);
};
$('dishDetail').addEventListener('cancel', e => {
  e.preventDefault();
  closeDetail();
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-open-dish]')) {
    e.preventDefault();
    openDetail(e.target.dataset.openDish);
  }
});
function deleteDish(id) {
  const used = Object.values(data.plans).some(p => Object.values(p).some(list => list.some(i => i.source !== 'takeout' && i.dishId === id)));
  if (confirm('删除这道菜品？' + (used ? '它也会从已有计划中移除。' : ''))) {
    if (mutate(x => {
        x.dishes = x.dishes.filter(d => d.id !== id);
        for (const p of Object.values(x.plans))
          for (const k of Object.keys(p))
            p[k] = p[k].filter(i => i.source === 'takeout' || i.dishId !== id);
      })) {
      if ($('dishDetail').open)
        $('dishDetail').close();
      detailId = null;
      detailTrail = [];
      toast('菜品已删除');
    }
  }
}
function openDish(id) {
  const d = data.dishes.find(x => x.id === id);
  $('dishForm').reset();
  $('dishId').value = d ? d.id : '';
  $('dishTitle').textContent = d ? '编辑菜品' : '新增菜品';
  $('dishCategory').innerHTML = '<option value="">暂不分类</option>' + options(categoryOrder(), d ? d.category : activeCategory);
  photoState.dishImage = d ? dishPhoto(d) : '';
  setPreview('dishPhotoPreview', photoState.dishImage);
  if (d) {
    $('dishName').value = d.name;
    $('dishCalories').value = d.calories ?? '';
    $('dishFiber').value = d.fiber ?? '';
    $('dishRecipe').value = recipeFor(d);
  }
  $('dishDialog').showModal();
}
$('dishForm').onsubmit = e => {
  e.preventDefault();
  const name = $('dishName').value.trim();
  if (!name)
    return toast('请输入菜名');
  const category = $('dishCategory').value || '未分类';
  const d = {
    id: $('dishId').value || uid(),
    name,
    category,
    image: photoState.dishImage || '',
    calories: numberInput('dishCalories'),
    fiber: numberInput('dishFiber'),
    recipe: $('dishRecipe').value.trim()
  };
  if (!optionalNumber(d.calories, 10000) || !optionalNumber(d.fiber, 100))
    return toast('请检查营养数值');
  if (data.dishes.some(x => x.id !== d.id && x.category === category && x.name === name))
    return toast('此分类已存在同名菜品');
  if (mutate(x => {
      if (!x.categories.includes(category))
        x.categories.push(category);
      const n = x.dishes.findIndex(i => i.id === d.id);
      if (n < 0)
        x.dishes.push(d);
      else
        x.dishes[n] = d;
    })) {
    $('dishDialog').close();
    if ($('dishDetail').open && detailId === d.id)
      openDetail(d.id, false);
    toast('菜品已保存');
  }
};

export { categoryOrder, closeDetail, renderDishes };
