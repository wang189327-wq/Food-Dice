import { PHOTO_CREDITS } from './asset-credits.js';
import { $, esc, toast } from './data.js';
import { data, restoreBackup } from './store.js';
import { validate, MAX_BACKUP_CHARS } from './validation.js';

let downloading = false;
const setDownload = on => {
  downloading = on;
  $('installUpdate').textContent = on ? '取消下载' : '下载并安装新版本';
};
// 下载过程由原生提示驱动，收到终态消息后恢复按钮
window.updateStatus = s => {
  $('updateStatus').textContent = s;
  if (!/正在下载安装包|正在取消下载/.test(s))
    setDownload(false);
};
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
$('resetUpdateUrl').onclick = () => {
  if (window.Native) {
    Native.resetUpdateUrl();
    $('updateUrl').value = Native.updateUrl();
  } else {
    localStorage.removeItem('menu-update-url');
    $('updateUrl').value = '';
  }
  toast('已恢复默认更新地址');
};
$('installUpdate').onclick = () => {
  if (!window.Native)
    return toast('请在安卓应用中使用更新功能');
  if (downloading)
    return Native.cancelInstall();
  setDownload(true);
  Native.install();
};
$('export').onclick = () => {
  const formatted = JSON.stringify(data, null, 2);
  // 超限时改用紧凑格式，保证导出的备份一定能被恢复入口接受
  const text = formatted.length > MAX_BACKUP_CHARS ? JSON.stringify(data) : formatted;
  if (text.length > MAX_BACKUP_CHARS)
    return toast('数据已超过备份上限，请先删除部分图片再导出');
  $('backup').value = text;
  toast(text === formatted ? '备份已生成，请复制保存' : '备份较长，已改用紧凑格式，请复制保存');
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
  const text = $('backup').value;
  // 先按文字长度拦一次，避免把超大内容交给 JSON.parse
  if (text.length > MAX_BACKUP_CHARS)
    return toast('备份文字过大，请确认内容完整');
  try {
    const x = validate(JSON.parse(text));
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
