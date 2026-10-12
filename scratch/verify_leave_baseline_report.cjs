const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname,'..');
(async()=>{
  const evidence = JSON.parse(await fs.readFile(path.join(__dirname,'leave-baseline-audit-20261012/verification.json'),'utf8'));
  assert.equal(evidence.missingReferences.length,0);
  assert.equal(evidence.csvPages,123);
  assert.equal(evidence.findings,29);
  const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--allow-file-access-from-files']});
  try{
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width:1280,height:900});
    await page.goto(pathToFileURL(path.join(root,'docs/audits/2026-10-12-leave-baseline-gallery.html')).href,{waitUntil:'networkidle0'});
    assert.equal(await page.$$eval('article',nodes=>nodes.length),106);
    assert.ok(await page.$eval('#referenceImage',node=>node.complete&&node.naturalWidth===390));
    await page.select('#module','employee-career');
    assert.ok(await page.$$eval('article:not([hidden])',nodes=>nodes.length>0&&nodes.every(node=>node.dataset.module==='employee-career')));
    await page.select('#theme','light');
    assert.ok(await page.$eval('#referenceImage',node=>node.src.endsWith('003-light.png')));
    await page.type('#search','New User Details');
    assert.equal(await page.$$eval('article:not([hidden])',nodes=>nodes.length),2);
    await page.click('article:not([hidden]) .image-button');
    assert.equal(await page.$eval('#zoom',node=>node.open),true);
    await page.click('#closeZoom');
    assert.equal(await page.$eval('#zoom',node=>node.open),false);
    await page.setViewport({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    assert.deepEqual(errors,[]);
    console.log('PASS: 29 findings, 123 coverage rows, all source/image references, 106 gallery cases, module/search/theme/zoom and mobile layout.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
