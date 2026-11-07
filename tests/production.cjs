const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert');
(async () => {
  const root = path.dirname(__dirname), assets = path.join(root, 'android/assets');
  const server = http.createServer((q, r) => {
    const p = new URL(q.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!/^(index\.html|js\/[a-z-]+\.js|css\/app\.css|photos\/[\w.-]+)$/.test(p)) {
      r.writeHead(404);
      return r.end();
    }
    r.setHeader('Content-Type', p.endsWith('.js') ? 'application/javascript'
      : p.endsWith('.css') ? 'text/css'
      : p.endsWith('.svg') ? 'image/svg+xml'
      : p.endsWith('.jpg') || p.endsWith('.jpeg') ? 'image/jpeg' : 'text/html;charset=utf-8');
    r.end(fs.readFileSync(path.join(assets, p)));
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
    await page.route('https://menu.local/photos/**', route => {
      const name = new URL(route.request().url()).pathname.split('/').pop();
      return route.fulfill({
        path: path.join(assets, 'photos', name),
        contentType: name.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg'
      });
    });
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.waitForFunction(() => document.querySelectorAll('#dishList .dish').length === 70);
    await page.screenshot({path: path.join(root, 'docs/screenshots/menu.png')});
    await page.locator('#dishList .dish').first().click();
    await page.screenshot({path: path.join(root, 'docs/screenshots/detail.png')});
    await page.locator('#detailEdit').click();
    await page.waitForFunction(() => document.querySelector('#dishPhotoPreview').naturalWidth > 0);
    await page.locator('[data-close="dishDialog"]').click();
    await page.evaluate(() => window.handleBack());
    const result = await page.evaluate(async () => {
      const store = await import('/js/store.js'), media = await import('/js/data.js');
      return {
        dishes: store.data.dishes.length,
        shops: store.data.takeouts.length,
        leaked: [
          'data',
          'mutate',
          'renderDishes',
          'photoState',
          'detailId',
          'chosen'
        ].filter(k => Object.hasOwn(window, k)),
        fallback: media.displayImage('https://menu.local/photos/not-in-build.jpg')
      };
    });
    assert.equal(result.dishes, 70);
    assert.equal(result.shops, 18);
    assert.deepEqual(result.leaked, []);
    assert(result.fallback.endsWith('/placeholder.svg'));
    assert.deepEqual(errors, []);
    console.log('Production ESM startup passed; no business globals; missing images use local placeholder.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
