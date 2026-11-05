const {instrumentHtml} = require('./test-page.cjs');
const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert');
(async () => {
  const root = path.dirname(__dirname), assets = path.join(root, 'android/assets');
  const server = http.createServer((q, r) => {
    const relative = new URL(q.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!/^(index\.html|js\/[a-z-]+\.js|css\/app\.css)$/.test(relative)) {
      r.writeHead(404);
      return r.end();
    }
    r.setHeader('Content-Type', relative.endsWith('.js') ? 'application/javascript' : relative.endsWith('.css') ? 'text/css' : 'text/html;charset=utf-8');
    const content = fs.readFileSync(path.join(assets, relative));
    r.end(relative === 'index.html' ? instrumentHtml(content) : content);
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.on('listening', r));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
        viewport: {
          width: 390,
          height: 844
        }
      }), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://menu.local/photos/**', route => route.fulfill({
      path: path.join(assets, 'photos', new URL(route.request().url()).pathname.split('/').pop()),
      contentType: route.request().url().endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg'
    }));
    const old = {
      schema: 1,
      seedVersion: 1,
      menu130: true,
      categories: ['小炒菜'],
      dishes: [{
          id: 'old',
          name: '用户原菜',
          category: '小炒菜',
          calories: 80,
          fiber: 2,
          recipe: '用户原做法',
          image: ''
        }],
      plans: {
        '2026-12-31': {
          lunch: [{
              dishId: 'old',
              grams: 200
            }]
        }
      },
      takeouts: []
    };
    await page.addInitScript(saved => {
      window.mockNative = {
        saved: JSON.stringify(saved),
        writable: false
      };
      window.Native = {
        load: () => mockNative.saved,
        save: value => {
          if (!mockNative.writable)
            return false;
          mockNative.saved = value;
          return true;
        },
        updateUrl: () => 'https://example.com/update.json',
        setUpdateUrl() {
        },
        check() {
        },
        install() {
        }
      };
    }, old);
    await page.goto('http://127.0.0.1:' + server.address().port);
    assert.deepEqual(await page.evaluate(() => data.plans), old.plans);
    await page.locator('#newDish').click();
    await page.locator('#dishName').fill('不能丢失原数据');
    await page.locator('#dishForm button').last().click();
    assert.equal(await page.evaluate(() => data.dishes.length), 1);
    assert.equal(await page.evaluate(() => JSON.parse(mockNative.saved).dishes.length), 1);
    assert(await page.locator('#dishDialog').isVisible());
    assert((await page.locator('#toast').innerText()).includes('保存失败'));
    await page.evaluate(() => mockNative.writable = true);
    const fixture = await page.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 400;
      c.getContext('2d').fillRect(0, 0, 800, 400);
      return c.toDataURL('image/png');
    });
    const file = {
      name: 'wide.png',
      mimeType: 'image/png',
      buffer: Buffer.from(fixture.split(',')[1], 'base64')
    };
    await page.locator('#dishPhoto').setInputFiles(file);
    await page.locator('#cropDialog').waitFor({ state: 'visible' });
    await page.locator('#cropCancel').click();
    assert.equal(await page.evaluate(() => dishImage), '');
    await page.locator('#dishPhoto').setInputFiles(file);
    await page.locator('#cropDialog').waitFor({ state: 'visible' });
    await page.locator('#cropSave').click();
    await page.locator('#dishName').fill('带照片的新菜');
    await page.locator('#dishForm button').last().click();
    const created = await page.evaluate(() => JSON.parse(mockNative.saved).dishes.find(d => d.name === '带照片的新菜'));
    assert(created.image.startsWith('data:image/jpeg;base64,'));
    assert.deepEqual(await page.evaluate(src => new Promise(resolve => {
      const im = new Image();
      im.onload = () => resolve([
        im.width,
        im.height
      ]);
      im.src = src;
    }), created.image), [
      384,
      384
    ]);
    assert.equal(await page.evaluate(() => total(data.plans['2026-12-31'].lunch).calories), 160);
    await page.evaluate(() => mutate(next => {
      next.dishes.find(d => d.id === 'old').calories = 100;
    }));
    assert.equal(await page.evaluate(() => total(data.plans['2026-12-31'].lunch).calories), 200);
    assert.equal(await page.evaluate(() => data.dishes.find(d => d.id === 'old').recipe), '用户原做法');
    assert.equal(await page.evaluate(() => mutate(next => {
      next.dishes.find(d => d.id === 'old').fiber = -1;
    })), false);
    assert.equal(await page.evaluate(() => data.dishes.find(d => d.id === 'old').fiber), 2);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(root, 'native-storage-verification.json'), JSON.stringify({
      passed: true,
      checks: [
        'Native桥旧数据加载',
        '写入失败回滚',
        '裁剪取消保留原图',
        '384方图保存',
        '编辑后计划索引更新',
        '用户做法保留'
      ],
      realDeviceTested: false
    }, null, 2));
    console.log('Native bridge, save failure rollback, crop and plan index checks passed.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
