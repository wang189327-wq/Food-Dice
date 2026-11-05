import { $, toast, displayImage } from './data.js';
import { validImage } from './validation.js';

const photoState = { dishImage: '', takeoutImage: '', cropImage: null, cropTarget: '' };
function setPreview(id, src) {
  if (src)
    $(id).src = displayImage(src);
  else
    $(id).removeAttribute('src');
}
function drawCrop() {
  if (!photoState.cropImage)
    return;
  const canvas = $('cropCanvas'), ctx = canvas.getContext('2d'), size = 384;
  const scale = Math.max(size / photoState.cropImage.naturalWidth, size / photoState.cropImage.naturalHeight) * Number($('cropZoom').value);
  const w = photoState.cropImage.naturalWidth * scale, h = photoState.cropImage.naturalHeight * scale;
  const x = (size - w) / 2 - Number($('cropX').value) * (w - size) / 2, y = (size - h) / 2 - Number($('cropY').value) * (h - size) / 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(photoState.cropImage, x, y, w, h);
}
async function choosePhoto(input, target) {
  const file = input.files?.[0];
  if (!file)
    return;
  if (![
      'image/jpeg',
      'image/png',
      'image/webp'
    ].includes(file.type)) {
    input.value = '';
    return toast('请选择 JPG、PNG 或 WebP 图片');
  }
  if (file.size > 15 * 1024 * 1024) {
    input.value = '';
    return toast('图片请小于15MB');
  }
  try {
    const url = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(Error('无法打开这张图片'));
      i.src = url;
    });
    if (img.naturalWidth * img.naturalHeight > 50000000)
      throw Error('图片尺寸过大，请先缩小');
    photoState.cropImage = img;
    photoState.cropTarget = target;
    for (const id of [
        'cropX',
        'cropY'
      ])
      $(id).value = 0;
    $('cropZoom').value = 1;
    drawCrop();
    $('cropDialog').showModal();
  } catch (e) {
    toast(e.message);
  } finally {
    input.value = '';
  }
}
$('dishPhoto').onchange = () => choosePhoto($('dishPhoto'), 'dish');
$('takeoutPhoto').onchange = () => choosePhoto($('takeoutPhoto'), 'takeout');
for (const id of [
    'cropZoom',
    'cropX',
    'cropY'
  ])
  $(id).oninput = drawCrop;
$('cropCancel').onclick = () => {
  $('cropDialog').close();
  photoState.cropImage = null;
};
$('cropDialog').addEventListener('cancel', () => {
  photoState.cropImage = null;
});
$('cropSave').onclick = () => {
  if (!photoState.cropImage)
    return;
  let image = $('cropCanvas').toDataURL('image/jpeg', 0.78);
  if (!validImage(image))
    return toast('图片过大，请换一张图片');
  if (photoState.cropTarget === 'dish') {
    photoState.dishImage = image;
    setPreview('dishPhotoPreview', image);
  } else {
    photoState.takeoutImage = image;
    setPreview('takeoutPhotoPreview', image);
  }
  $('cropDialog').close();
  photoState.cropImage = null;
};

export { photoState, setPreview };
