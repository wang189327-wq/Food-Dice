import './settings.js';
import { closeDetail, renderDishes } from './catalog.js';
import { renderPlan } from './planner.js';
import { initializeDraw, renderDraw } from './draw.js';
import { renderTakeouts } from './takeout.js';
import { $, today } from './data.js';
import { photoState } from './photos.js';
import { APP_VERSION } from './version.js';
import { ensureStarterCatalog, seedPresets, subscribe } from './store.js';

function render() {
  renderDishes();
  renderPlan();
  renderDraw();
  renderTakeouts();
}
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
  document.querySelectorAll('.section').forEach(x => x.classList.toggle('active', x.id === b.dataset.tab));
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x === b));
  $('appHeader').style.display = 'none';
  window.scrollTo(0, 0);
});
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => $(b.dataset.close).close());
window.handleBack = () => {
  if ($('cropDialog').open) {
    $('cropDialog').close();
    photoState.cropImage = null;
    return true;
  }
  for (const id of [
      'dishDialog',
      'takeoutDialog',
      'mealDialog',
      'categoryDialog'
    ])
    if ($(id).open) {
      $(id).close();
      return true;
    }
  if ($('dishDetail').open) {
    closeDetail();
    return true;
  }
  return false;
};
subscribe(render);
$('currentVersion').textContent = '美味餐饮 ' + APP_VERSION.name;
$('planDate').value = today();
seedPresets();
ensureStarterCatalog();
initializeDraw();
render();

