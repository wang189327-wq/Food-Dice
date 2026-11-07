import { chromium } from 'playwright';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 需先启动静态服务：python -m http.server 8080 --directory android/assets
const BASE = process.env.DEMO_BASE || 'http://127.0.0.1:8080/';
const DIR = fileURLToPath(new URL('../docs/screenshots/_frames', import.meta.url));
fs.mkdirSync(DIR, { recursive: true });

// 服务未启动时给出可执行的指引，而不是 Playwright 的晦涩报错
try {
  const res = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (error) {
  console.error(`无法访问 ${BASE}（${error.message}）`);
  console.error('请先在仓库根目录运行：python -m http.server 8080 --directory android/assets');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const shot = async (name) => {
  await page.screenshot({ path: `${DIR}/${name}.png` });
  console.log('saved', name);
};
const waitImgs = () => page.waitForFunction(
  () => [...document.images].every(i => i.complete), null, { timeout: 8000 }).catch(() => {});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#dishList .dish', { timeout: 15000 });
await page.waitForTimeout(1500);
await waitImgs();
await shot('1-menu');

// 切分类：高蛋白
await page.locator('#categorySidebar button', { hasText: '高蛋白' }).click();
await page.waitForTimeout(900);
await waitImgs();
await shot('2-category');

// 打开第一个菜品详情
await page.locator('#dishList .dish').first().click();
await page.waitForTimeout(1100);
await waitImgs();
await shot('3-detail');

// 关闭详情 -> 用餐计划
await page.locator('#detailBack').click();
await page.waitForTimeout(400);
await page.click('nav button[data-tab="plan"]');
await page.waitForTimeout(400);
async function addMeal(tab, keyword) {
  await page.click(`[data-add-meal="${tab}"]`);
  await page.waitForTimeout(300);
  await page.fill('#mealSearch', keyword);
  await page.waitForTimeout(400);
  const n = await page.locator('#mealDish option').count();
  await page.selectOption('#mealDish', { index: n > 1 ? 1 : 0 });
  await page.locator('#mealForm button:not(.secondary)').last().click();
  await page.waitForTimeout(500);
}
await addMeal('lunch', '鸡');
await addMeal('dinner', '饭');
await page.evaluate(() => window.scrollBy(0, 46));
await page.waitForTimeout(700);
await shot('4-plan');

// 随机抽签：顶部 → 逐帧向下滚动，展示完整页面
await page.click('nav button[data-tab="draw"]');
await page.waitForTimeout(400);
await page.click('#selectAll');
await page.waitForTimeout(200);
await page.click('#drawButton');
await page.waitForTimeout(1500);
await waitImgs();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await waitImgs();
await shot('5-draw-top');

const maxY = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
console.log('draw page scroll range:', maxY);
const steps = 6;
for (let i = 1; i <= steps; i++) {
  await page.evaluate(y => window.scrollTo(0, y), Math.round(maxY * i / steps));
  await page.waitForTimeout(110);
  await shot(`5-draw-scroll-${i}`);
}

// 外卖
await page.click('nav button[data-tab="takeout"]');
await page.waitForTimeout(900);
await page.evaluate(() => window.scrollBy(0, 1200));
await page.waitForTimeout(900);
await page.evaluate(() => window.scrollTo(0, 0));
await waitImgs();
await page.waitForTimeout(600);
await shot('7-takeout');

await browser.close();
console.log('CAPTURE DONE');
