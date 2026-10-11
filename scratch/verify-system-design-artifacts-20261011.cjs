const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..');
async function main(){
  const dir=path.join(root,'docs','audits');
  const prefix='2026-10-11-system-design';
  const htmlPath=path.join(dir,prefix+'-gallery.html');
  const html=await fs.readFile(htmlPath,'utf8');
  const md=await fs.readFile(path.join(dir,prefix+'-audit.md'),'utf8');
  const findings=JSON.parse(await fs.readFile(path.join(__dirname,'system-design-audit-20261011','findings.json'),'utf8'));
  const focused=JSON.parse(await fs.readFile(path.join(__dirname,'system-design-audit-20261011','focused-observations.json'),'utf8'));
  assert.equal(findings.length,19);
  assert.equal((md.match(/^## (?:G|F|S|HC|D|N|H|B|FL|T|C)\d/gm)||[]).length,19);
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!/^(http|data)/.test(m[1]))await fs.access(path.resolve(dir,m[1]));
  const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--allow-file-access-from-files']});
  try{
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.setViewport({width:1440,height:1000});
    await page.goto(pathToFileURL(htmlPath).href,{waitUntil:'load'});
    const count=await page.$$eval('.case',nodes=>nodes.length);
    assert.equal(count,focused.filter(x=>x.screenshots?.length).length);
    const galleryIds=await page.$$eval('.case',nodes=>nodes.map(x=>x.id));
    for(const f of findings)for(const index of f.cases)assert.ok(galleryIds.includes('case-'+index),'Missing report screenshot anchor '+index);
    await page.type('#search','Leave');
    assert.ok(await page.$$eval('.case:not([hidden])',nodes=>nodes.length)>0);
    await page.select('#theme','dark');
    assert.ok(await page.$$eval('.case img',nodes=>nodes.every(x=>x.src.includes('-dark.png'))));
    await page.click('#reset');
    await page.select('#category','Benefit Entitlement');
    assert.ok(await page.$$eval('.case:not([hidden])',nodes=>nodes.length)>0);
    await page.click('.case:not([hidden]) .picture');
    assert.ok(await page.$eval('#zoom',node=>node.open));
    await page.click('#close');
    assert.equal(await page.$eval('#zoom',node=>node.open),false);
    await page.select('#category','');
    await page.select('#theme','light');
    await page.screenshot({path:path.join(__dirname,'system-design-audit-20261011','gallery-preview.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: 19 report findings, '+count+' screenshot cases, all report anchors, local links, search, component filter, both themes and zoom dialog verified.');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
