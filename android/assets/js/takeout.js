import { $, esc, fmt, numberInput, photoTag, toast, uid } from './data.js';
import { data, mutate } from './store.js';
import { photoState, setPreview } from './photos.js';
import { optionalNumber } from './validation.js';

$('takeoutSearch').oninput = renderTakeouts;
$('newTakeout').onclick = () => openTakeout();
function renderTakeouts() {
  const query = $('takeoutSearch').value.trim().toLocaleLowerCase();
  const list = (data.takeouts || []).filter(t => (t.shop + ' ' + t.dish).toLocaleLowerCase().includes(query));
  $('takeoutList').innerHTML = list.length ? list.map(t => `<div class="takeout-item">${ photoTag(t.image, t.shop || t.dish) }<div class="dish-info"><h3>${ esc(t.shop || t.dish) }</h3>${ t.shop && t.dish ? `<div class="shop-name">推荐：${ esc(t.dish) }</div>` : '' }<div class="stats">${ t.calories == null ? '卡路里未填写' : fmt(t.calories) + ' 千卡 / 份' }</div><div class="price">${ t.price == null ? '<small>价格未填写</small>' : '¥' + t.price.toFixed(2) + '<small> / 份</small>' }</div><div class="dish-actions"><button class="secondary" data-edit-takeout="${ esc(t.id) }">编辑</button><button class="danger" data-delete-takeout="${ esc(t.id) }">删除</button></div></div></div>`).join('') : '<div class="empty">还没有外卖记录</div>';
}
function openTakeout(id) {
  const t = (data.takeouts || []).find(x => x.id === id);
  $('takeoutForm').reset();
  $('takeoutId').value = t ? t.id : '';
  $('takeoutTitle').textContent = t ? '编辑外卖' : '新增外卖';
  photoState.takeoutImage = t?.image || '';
  setPreview('takeoutPhotoPreview', photoState.takeoutImage);
  if (t) {
    $('takeoutShop').value = t.shop;
    $('takeoutDish').value = t.dish;
    $('takeoutPrice').value = t.price ?? '';
    $('takeoutCalories').value = t.calories ?? '';
  }
  $('takeoutDialog').showModal();
}
$('takeoutForm').onsubmit = e => {
  e.preventDefault();
  const shop = $('takeoutShop').value.trim(), dish = $('takeoutDish').value.trim();
  if (!shop && !dish)
    return toast('请输入店铺或菜品名称');
  const t = {
    id: $('takeoutId').value || uid(),
    shop,
    dish,
    price: numberInput('takeoutPrice'),
    calories: numberInput('takeoutCalories'),
    image: photoState.takeoutImage || ''
  };
  if (!optionalNumber(t.price, 99999) || !optionalNumber(t.calories, 10000))
    return toast('请检查价格和卡路里');
  if (!data.takeouts?.some(x => x.id === t.id) && (data.takeouts || []).length >= 300)
    return toast('最多300条外卖记录');
  if (mutate(x => {
      x.takeouts ??= [];
      const n = x.takeouts.findIndex(i => i.id === t.id);
      if (n < 0)
        x.takeouts.push(t);
      else
        x.takeouts[n] = t;
    })) {
    $('takeoutDialog').close();
    toast('外卖已保存');
  }
};
$('takeoutList').onclick = e => {
  const b = e.target.closest('button');
  if (!b)
    return;
  if (b.dataset.editTakeout)
    openTakeout(b.dataset.editTakeout);
  if (b.dataset.deleteTakeout && confirm('删除这条外卖记录及计划中对它的引用？'))
    mutate(x => {
      x.takeouts = x.takeouts.filter(t => t.id !== b.dataset.deleteTakeout);
      for (const p of Object.values(x.plans))
        for (const k of Object.keys(p))
          p[k] = p[k].filter(i => i.source !== 'takeout' || i.dishId !== b.dataset.deleteTakeout);
    });
};

export { renderTakeouts };
