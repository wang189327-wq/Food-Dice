import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://127.0.0.1:8080/';
const DIR = 'docs/screenshots/_frames';
fs.mkdirSync(DIR, { recursive: true });

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

// 随机抽签：连拍 3 帧捕捉摇动过程
await page.click('nav button[data-tab="draw"]');
await page.waitForTimeout(400);
await page.click('#selectAll');
await page.waitForTimeout(200);
await page.click('#drawButton');
await page.waitForTimeout(130);
await shot('5a-draw-spin');
await page.waitForTimeout(160);
await shot('5b-draw-spin');
await page.waitForTimeout(1400);
await waitImgs();
await page.evaluate(() => {
  const el = document.querySelector('#drawResult');
  el && el.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(500);
await waitImgs();
await shot('6-draw-result');

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
