import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PROJECT_ROOT } from '../shared/paths.mjs';
const base = process.env.WEB_URL || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args:['--no-sandbox']});
try {
  const page = await browser.newPage();
  await page.setViewport({width:1440,height:900});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const screenshots = resolve(PROJECT_ROOT, 'docs/reports/screenshots/native');
  await mkdir(screenshots,{recursive:true});
  for (const [name, path] of [
    ['attendance', '/#/module/attendance'],
    ['attendance-team', '/#/module/attendance'],
    ['work-plan', '/workspace/modules/project-task/options/work-plan.html'],
    ['booking', '/workspace/modules/admin/options/book-resource.html'],
    ['leave', '/workspace/leave.html?view=apply&webAction=leave-apply'],
    ['jd', '/workspace/me.html?webAction=profile-jd'],
  ]) {
    await page.goto(base+path,{waitUntil:'networkidle0'});
    if (name==='attendance-team') await page.click('.module-workspace-scope[data-scope="team"]');
    await new Promise(r=>setTimeout(r,180));
    if (name === 'jd') {
      const width = await page.$eval('.jd-paper-sheet', (element) => element.getBoundingClientRect().width);
      assert(width >= 740 && width <= 802, 'The source JD paper must have a readable desktop dialog width');
    }
    await page.screenshot({path:resolve(screenshots,name+'.png'),fullPage:name !== 'jd'});
    console.log(JSON.stringify({name,url:page.url(),errors:errors.splice(0),metrics:await page.evaluate(()=>({
      css:[...document.styleSheets].map(s=>s.href).filter(Boolean),
      body:getComputedStyle(document.body).backgroundColor,
      width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
      sourceWidth:document.querySelector('.phone-container')?.getBoundingClientRect().width,
      headings:[...document.querySelectorAll('h1')].map(e=>e.textContent),
      frames:document.querySelectorAll('iframe').length,
    }))}));
  }
} finally {await browser.close();}
