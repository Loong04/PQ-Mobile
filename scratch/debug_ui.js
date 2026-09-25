const puppeteer = require('puppeteer');
const path = require('path');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900 });

  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().startsWith('http://') || req.url().startsWith('https://')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.stack || err.message));

  const filePath = 'file:///' + path.resolve('modules/attendance/options/shift-plan.html').replace(/\\/g, '/');
  console.log('Loading local HTML:', filePath);
  await page.goto(filePath, { waitUntil: 'domcontentloaded' });
  await delay(500);

  // Click Calendar Tab
  await page.click('#tabCalendarBtn');
  await delay(300);

  // Click Work Shift badge
  const btn = await page.$('.cal-summary-card div[onclick*="view-work-shift-summary"]');
  if (btn) {
    console.log('Clicking Work Shift badge...');
    await btn.click();
    await delay(300);
  }

  const details = await page.evaluate(() => {
    const target = document.getElementById('view-work-shift-summary');
    if (!target) return 'Not found';
    
    const childrenInfo = Array.from(target.children).map(c => ({
      tagName: c.tagName,
      className: c.className,
      id: c.id,
      offsetHeight: c.offsetHeight,
      clientHeight: c.clientHeight,
      computedDisplay: window.getComputedStyle(c).display,
      computedHeight: window.getComputedStyle(c).height
    }));

    return {
      targetId: target.id,
      targetOffsetHeight: target.offsetHeight,
      targetClientHeight: target.clientHeight,
      targetComputedHeight: window.getComputedStyle(target).height,
      targetComputedPosition: window.getComputedStyle(target).position,
      parentTagName: target.parentElement.tagName,
      parentClassName: target.parentElement.className,
      parentOffsetHeight: target.parentElement.offsetHeight,
      childrenInfo
    };
  });

  console.log('Details:', JSON.stringify(details, null, 2));

  await page.screenshot({ path: 'scratch/clicked_result.png' });

  await browser.close();
  console.log('Done script execution');
})();
