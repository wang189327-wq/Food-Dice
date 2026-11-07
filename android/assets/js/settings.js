import { PHOTO_CREDITS } from './asset-credits.js';
import { $, esc, toast } from './data.js';
import { data, restoreBackup } from './store.js';
import { validate } from './validation.js';

window.updateStatus = s => $('updateStatus').textContent = s;
$('updateUrl').value = window.Native ? Native.updateUrl() : localStorage.getItem('menu-update-url') || '';
$('checkUpdate').onclick = () => {
  const u = $('updateUrl').value.trim();
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:' || url.username || url.password)
      throw Error();
  } catch {
    return toast('请输入有效的 HTTPS 更新清单地址');
  }
  if (window.Native) {
    Native.setUpdateUrl(u);
    Native.check();
  } else {
    localStorage.setItem('menu-update-url', u);
    updateStatus('请在安卓应用内检测和安装更新');
  }
};
$('installUpdate').onclick = () => window.Native ? Native.install() : toast('请在安卓应用中使用更新功能');
$('export').onclick = () => {
  $('backup').value = JSON.stringify(data, null, 2);
  toast('备份已生成，请复制保存');
};
$('copyBackup').onclick = async () => {
  if (!$('backup').value)
    return toast('请先生成备份');
  try {
    await navigator.clipboard.writeText($('backup').value);
    toast('已复制备份');
  } catch {
    $('backup').focus();
    $('backup').select();
    toast('请长按备份文字选择“全选、复制”');
  }
};
$('restore').onclick = () => {
  try {
    const x = validate(JSON.parse($('backup').value));
    if (confirm('恢复将替换当前全部菜谱和计划，确定继续？')) {
      if (restoreBackup(x)) toast('备份已恢复');
    }
  } catch (e) {
    toast('无法恢复：' + e.message);
  }
};

$('showImageCredits').onclick = () => {
  $('imageCreditsBody').innerHTML = PHOTO_CREDITS.map(c => `<section class="image-credit"><h3>${esc(c.name)}</h3><p>${esc(c.title)}<br>作者：${esc(c.author)}<br>许可：<a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener">${esc(c.license)}</a><br>${esc(c.changes)}</p><a href="${esc(c.sourcePage)}" target="_blank" rel="noopener">查看原图与来源</a></section>`).join('');
  $('imageCredits').showModal();
};
$('imageCreditsBody').onclick = event => {
  const link = event.target.closest('a');
  if (link && window.Native) {
    event.preventDefault();
    if (typeof Native.openImageCredit === 'function') Native.openImageCredit(link.href);
    else toast('请在浏览器中查看图片来源');
  }
};
