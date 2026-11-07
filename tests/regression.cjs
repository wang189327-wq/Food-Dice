const {chromium} = require('playwright');
const {instrumentHtml} = require('./test-page.cjs');
const fs = require('fs'), path = require('path'), http = require('http'), assert = require('assert');
(async () => {
  const root = path.dirname(__dirname);
  const html = instrumentHtml(fs.readFileSync(root + '/android/assets/index.html'));
  const server = http.createServer((q, r) => {
    const u = new URL(q.url, 'http://localhost');
    if (u.pathname === '/') {
      r.setHeader('Content-Type', 'text/html;charset=utf-8');
      return r.end(html);
    }
    const relative = u.pathname.slice(1);
    if (!/^(js\/[a-z-]+\.js|css\/app\.css|photos\/[\w.-]+)$/.test(relative)) {
      r.writeHead(404);
      return r.end();
    }
    const type = relative.endsWith('.js') ? 'application/javascript;charset=utf-8'
      : relative.endsWith('.css') ? 'text/css;charset=utf-8'
      : relative.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
    r.setHeader('Content-Type', type);
    r.end(fs.readFileSync(path.join(root, 'android/assets', relative)));
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.on('listening', r));
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: {
        width: 390,
        height: 844
      }
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    await page.route('https://menu.local/photos/**', route => {
      const f = path.join(root, 'android/assets/photos', new URL(route.request().url()).pathname.split('/').pop());
      return fs.existsSync(f) ? route.fulfill({
        path: f,
        contentType: f.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg'
      }) : route.fulfill({
        status: 404,
        body: ''
      });
    });
    await page.goto(`http://127.0.0.1:${ server.address().port }`);
    const load = () => page.evaluate(() => JSON.parse(localStorage.getItem('menu-data')));
    let data = await load();
    assert(data, JSON.stringify(errors));
    assert.equal(data.dishes.length, 70);
    assert.equal(data.takeouts.length, 18);
    assert(data.takeouts.every(x => x.dish === '' && x.price === null && x.calories === null && x.image));
    assert(data.dishes.every(d => d.recipe));
    assert.equal(data.dishes.filter(d => d.category === '主食').length, 8);
    assert.equal(data.dishes.find(d => d.name === '煎牛排').category, '高蛋白');
    assert.equal(await page.locator('#dishList .menu-group').count(), 6);
    assert.equal(await page.locator('#dishList .dish').count(), 70);
    assert.equal(await page.locator('#dishList [data-edit]').count(), 0);
    const top = await page.locator('#newDish').boundingBox();
    assert(top.y >= 0 && top.y < 18);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundImage), 'none');
    assert.equal(await page.locator('#settings .theme-cover-row').count(), 0);
    const pics = await page.evaluate(async () => {
      const urls = [
        ...PRESET_DISHES.map(d => dishPhoto(d)),
        ...PRESET_SHOPS.map(t => t.image),
        'https://menu.local/photos/app-cover.jpg'
      ];
      return Promise.all(urls.map(src => new Promise(resolve => {
        const i = new Image();
        i.onload = () => resolve(i.naturalWidth === i.naturalHeight);
        i.onerror = () => resolve(false);
        i.src = displayImage(src);
      })));
    });
    assert.equal(pics.length, 89);
    assert(pics.every(Boolean));
    const repeated = await page.evaluate(() => {
      const once = displayImage(PRESET_DISHES[0].image);
      return {once, twice: displayImage(once), missing: displayImage('https://menu.local/photos/not-bundled.jpg')};
    });
    assert.equal(repeated.twice, repeated.once);
    assert.equal(repeated.missing, 'photos/placeholder.svg');
    await page.screenshot({ path: root + '/菜谱预览.png' });
    await page.locator('#categorySidebar button').filter({ hasText: '主食' }).click();
    await page.waitForTimeout(650);
    const current = await page.locator('#categorySidebar .selected').innerText();
    assert([
      '主食',
      '炖汤'
    ].includes(current));
    await page.locator('#categorySidebar button').filter({ hasText: '小炒菜' }).click();
    await page.waitForTimeout(650);
    const first = await page.locator('#dishList [data-open-dish]').first().getAttribute('data-open-dish');
    await page.locator('#dishList [data-open-dish]').first().click();
    assert(await page.locator('#dishDetail').isVisible());
    assert((await page.locator('.recipe-text').innerText()).includes('1.'));
    assert((await page.locator('.detail-summary').innerText()).includes('膳食纤维'));
    assert.equal(await page.locator('#dishDetail .recommend-card').count(), 6);
    const firstRecs = await page.locator('#dishDetail .recommend-card').evaluateAll(cs => cs.map(c => c.dataset.openDish));
    await page.locator('#refreshRecommendations').click();
    const nextRecs = await page.locator('#dishDetail .recommend-card').evaluateAll(cs => cs.map(c => c.dataset.openDish));
    const choices = Object.fromEntries(data.categories.map(c => [c, data.dishes.filter(d => d.category === c && d.id !== first).map(d => d.id)]));
    for (let n = 0; n < nextRecs.length; n++) {
      const category = data.dishes.find(d => d.id === firstRecs[n]).category;
      if (choices[category].length > 1) assert.notEqual(nextRecs[n], firstRecs[n]);
      else assert.equal(nextRecs[n], firstRecs[n]);
    }
    await page.screenshot({ path: root + '/菜品详情预览.png' });
    await page.locator('#dishDetail .recommend-card').first().click();
    assert.notEqual(await page.locator('#detailBody').getAttribute('data-dish-id'), first);
    await page.locator('#detailBack').click();
    assert.equal(await page.locator('#detailBody').getAttribute('data-dish-id'), first);
    await page.evaluate(() => document.querySelector('#dishDetail').scrollTop = 0);
    await page.locator('#detailEdit').click();
    assert(await page.locator('#dishDialog').isVisible());
    await page.locator('[data-close="dishDialog"]').click();
    await page.evaluate(() => window.handleBack());
    assert.equal(await page.locator('#dishDetail').isVisible(), false);
    await page.locator('#newDish').click();
    await page.locator('#dishName').fill('只填名字菜');
    await page.locator('#dishCategory').selectOption('');
    await page.locator('#dishForm button').last().click();
    data = await load();
    const only = data.dishes.find(d => d.name === '只填名字菜');
    assert(only && only.calories === null && only.fiber === null && !only.image && only.category === '未分类');
    await page.reload();
    assert((await load()).dishes.some(d => d.name === '只填名字菜'));
    await page.locator('[data-tab="takeout"]').click();
    assert.equal(await page.locator('.takeout-item').count(), 18);
    await page.locator('#takeoutSearch').fill('曹氏鸭脖');
    await page.screenshot({ path: root + '/曹氏鸭脖预览.png' });
    await page.locator('#takeoutSearch').fill('');
    await page.screenshot({ path: root + '/外卖预览.png' });
    await page.locator('#newTakeout').click();
    await page.locator('#takeoutShop').fill('只填店名');
    await page.locator('#takeoutForm button').last().click();
    data = await load();
    assert(data.takeouts.some(t => t.shop === '只填店名' && t.price === null && t.calories === null && !t.image));
    await page.locator('#newTakeout').click();
    await page.locator('#takeoutDish').fill('只填菜名');
    await page.locator('#takeoutForm button').last().click();
    assert((await load()).takeouts.some(t => t.dish === '只填菜名'));
    await page.locator('[data-tab="draw"]').click();
    await page.locator('#selectNone').click();
    await page.locator('#drawCategories input[value="__takeout__"]').check();
    await page.locator('#drawButton').click();
    assert((await page.locator('#drawResult').innerText()).includes('外卖'));
    await page.locator('#drawDate').fill('2027-01-15');
    await page.locator('[data-draw-meal="lunch"]').click();
    assert.equal(await page.locator('#mealDate').inputValue(), '2027-01-15');
    assert((await page.locator('#mealDish').inputValue()).startsWith('takeout:'));
    await page.locator('#mealForm button').last().click();
    data = await load();
    assert.equal(data.plans['2027-01-15'].lunch[0].source, 'takeout');
    assert((await page.locator('#dayTotal').innerText()).includes('部分营养未填写'));
    await page.locator('#selectNone').click();
    await page.locator('#drawCategories input[value="主食"]').check();
    await page.locator('#drawButton').click();
    await page.locator('#drawDate').fill('2027-02-16');
    await page.locator('[data-draw-meal="dinner"]').click();
    await page.locator('#mealSearch').fill('糙米');
    assert.equal(await page.locator('#mealDish option').count(), 1);
    assert((await page.locator('#mealDish').innerText()).includes('糙米饭'));
    await page.locator('#mealForm button').last().click();
    data = await load();
    assert.equal(data.plans['2027-02-16'].dinner[0].grams, 100);
    assert.equal(data.dishes.find(d => d.id === data.plans['2027-02-16'].dinner[0].dishId).name, '糙米饭');
    await page.locator('#drawButton').click();
    await page.screenshot({ path: root + '/抽签预览.png' });
    await page.locator('[data-tab="settings"]').click();
    assert.equal(await page.locator('#appHeader').isVisible(), false);
    assert.equal(await page.locator('#settings .theme-cover-row').count(), 0);
    assert((await page.locator('#settings h2').first().boundingBox()).y < 25);
    await page.screenshot({ path: root + '/设置页面预览.png' });
    await page.locator('#export').click();
    const backup = JSON.parse(await page.locator('#backup').inputValue());
    assert.equal(backup.takeouts.length, 20);
    await page.locator('#restore').click();
    assert((await page.locator('#toast').innerText()).includes('已恢复'));
    // Simulate an old 1.2.0 data set with custom edits and plans.
    const old = {
      schema: 1,
      seedVersion: 1,
      categories: [
        '小炒菜',
        '高蛋白',
        '减脂菜',
        '凉菜',
        '炖汤',
        '主食'
      ],
      dishes: [{
          id: 'kept',
          name: '青椒炒肉',
          category: '小炒菜',
          calories: 999,
          fiber: 2
        }],
      plans: {
        '2026-12-30': {
          dinner: [{
              dishId: 'kept',
              grams: 150
            }]
        }
      },
      takeouts: [{
          id: 'kfc',
          shop: '肯德基',
          dish: '用户原推荐',
          price: 30,
          calories: 500,
          image: ''
        }]
    };
    await page.evaluate(x => localStorage.setItem('menu-data', JSON.stringify(x)), old);
    await page.reload();
    data = await load();
    assert.equal(data.dishes.length, 10);
    assert.equal(data.dishes.find(d => d.id === 'kept').calories, 999);
    assert.deepEqual(data.plans, old.plans);
    assert.equal(data.takeouts.length, 18);
    assert.equal(data.takeouts.find(t => t.id === 'kfc').dish, '用户原推荐');
    await page.reload();
    assert.equal((await load()).dishes.length, 10);
    assert.equal((await load()).takeouts.length, 18);
    assert.deepEqual(errors, []);
    await page.setViewportSize({
      width: 320,
      height: 740
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const report = {
      passed: true,
      presetDishes: 70,
      staples: 8,
      presetRestaurants: 18,
      imageReferences: 89,
      checks: [
        '连续六分类菜单与侧栏导航',
        '详情大图及营养做法',
        '每类推荐且连续不重复',
        '推荐跳转和返回',
        '详情编辑入口',
        '仅名称必填且空值不作零',
        '18家餐厅只写名称和图',
        '8种主食及煎牛排',
        '纯外卖抽签',
        '抽签日期加入指定日餐次',
        '添加计划关键词搜索',
        '外卖按份与未知营养提示',
        '含空值及外卖的备份恢复',
        '旧数据和计划无损补充且不重复',
        '图片与缺图占位回退加载',
        '图片地址重复处理不退化',
        '320px无横向溢出'
      ],
      androidStatusBarImplementation: 'native explicit edge-to-edge + systemBars/displayCutout/IME once; no extra minimum/gap',
      realDeviceTested: false
    };
    fs.writeFileSync(root + '/verification.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
