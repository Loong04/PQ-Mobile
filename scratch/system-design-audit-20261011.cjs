/* Read-only design audit. Product files are hashed and never edited. */
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'system-design-audit-20261011');
const omit = new Set(['node_modules', '.git', '.agents', '.codex', '.aws', '.claude', '.gemini', 'scratch', 'docs']);
const norm = p => path.relative(root, p).replace(/\\/g, '/');
async function walk(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, {withFileTypes:true})) {
    if (item.isDirectory() && !omit.has(item.name)) result.push(...await walk(path.join(dir, item.name)));
    else if (item.isFile() && /\.(html|css|js)$/.test(item.name)) result.push(path.join(dir,item.name));
  }
  return result;
}
function inspect() {
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const snapshot = el => {
    const s = getComputedStyle(el), r=el.getBoundingClientRect();
    return {tag:el.tagName, id:el.id, cls:el.className?.baseVal ?? el.className,
      text:clean(el.textContent).slice(0,170), visible:visible(el),
      radius:s.borderRadius, padding:s.padding, background:s.backgroundColor, image:s.backgroundImage,
      border:s.border, borderLeft:s.borderLeft, color:s.color, font:s.fontFamily, fontSize:s.fontSize,
      weight:s.fontWeight, gap:s.gap, display:s.display, whiteSpace:s.whiteSpace,
      position:s.position, width:Math.round(r.width),height:Math.round(r.height),
      overflow:el.scrollWidth>el.clientWidth+2, x:Math.round(r.x),y:Math.round(r.y),
      onclick:el.getAttribute('onclick'), role:el.getAttribute('role')};
  };
  const select = (selector, count=35) => [...document.querySelectorAll(selector)].sort((a,b)=>Number(visible(b))-Number(visible(a))).slice(0,count).map(snapshot);
  const charts = [...document.querySelectorAll('button,a,[onclick]')].filter(el=>/^View Chart$/i.test(clean(el.textContent)) || /^View Chart$/i.test(el.title || '') || /^View Chart$/i.test(el.getAttribute('aria-label')||'')).map(el=>({...snapshot(el),pie:!!el.querySelector('.fa-chart-pie'),hasText:/View Chart/i.test(clean(el.textContent))}));
  const fields = [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].map(el=>({...snapshot(el),type:el.type,label:clean(el.labels?.[0]?.textContent),placeholder:el.getAttribute('placeholder')}));
  const ids = [...document.querySelectorAll('[class*=emp-id],[class*=emp-no],[class*=employee-id],[class*=employee-no],[class*=empno],[class*=staff-id],[id*=EmpId],[id*=EmpNo]')].map(el=>({...snapshot(el),parentText:clean(el.parentElement?.textContent).slice(0,200),html:el.parentElement?.outerHTML.slice(0,1500)}));
  const cardNodes = [...document.querySelectorAll('[class]')].filter(el=>/(?:^|[ -])(?:card|record)(?:[ -]|$)/.test(String(el.className)) && !/grid|list|title|header|footer|icon|body|count|label|row|actions|details|detail|value|badge|content|sub/.test(String(el.className)));
  return {title:document.title, url:location.href, theme:document.documentElement.dataset.theme,
    links:[...document.querySelectorAll('a[href]')].map(el=>({text:clean(el.textContent).slice(0,80),href:el.getAttribute('href')})),
    css:[...document.querySelectorAll('link[rel=stylesheet]')].map(el=>el.getAttribute('href')),
    phone:select('.phone-container',1), main:select('.main-content',1),
    headings:select('h1,h2,h3',20), fields,
    cards:cardNodes.sort((a,b)=>Number(visible(b))-Number(visible(a))).slice(0,70).map(el=>({...snapshot(el),status:el.dataset.status||el.dataset.documentStatus||'',chevron:!!el.querySelector('.fa-chevron-right'),dateBadge:!!el.querySelector('.history-date-badge')})),
    status:select('.work-status-card,[data-document-status],.status-card,.employee-career-status-card,.payroll-status-card',15),
    filters:select('[class*=filter-panel],[class*=filter-bar],[class*=filter-pill],[class*=period-tabs],[class*=period-tab],[class*=standard-filter]',45),
    tables:[...document.querySelectorAll('table')].slice(0,15).map(el=>({...snapshot(el),heads:[...el.querySelectorAll('th')].map(snapshot),cells:[...el.querySelectorAll('td')].slice(0,5).map(snapshot)})),
    overlays:select('[class*=overlay],[class*=modal-panel],[class*=modal-content],[class*=details-dialog],[class*=detail-panel],[class*=detail-sheet],dialog',25),
    charts, ids,
    buttons:select('button',70),
    svgCount:document.querySelectorAll('svg').length,
    canvasCount:document.querySelectorAll('canvas').length,
    scrollIssues:select('.phone-container,.main-content,[class*=filter-panel],[class*=modal-content]').filter(el=>el.visible&&el.overflow)};
}
async function main() {
  await fs.mkdir(out,{recursive:true});
  const files = await walk(root), inventory=[];
  for(const file of files){
    const src=await fs.readFile(file,'utf8'), rel=norm(file);
    inventory.push({file:rel,bytes:Buffer.byteLength(src),lines:src.split('\n').length,
      sha256:crypto.createHash('sha256').update(src).digest('hex'),
      legacy:rel.startsWith('no/')||['light.html','modules/leave/index.html','modules/me/index.html','me-accordion.html'].includes(rel),
      refs:[...src.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m=>m[1]),
      components:{forms:/<(?:form|input|select|textarea)\b/i.test(src),details:/detail-popout|record-detail-table/.test(src),history:/history-card-item|history-item-card/.test(src),highlight:/highlight/i.test(src),benefit:/benefit/i.test(src),table:/<table\b/i.test(src),filter:/filter/i.test(src),chart:/chart|<svg|canvas/i.test(src)},
      inlineStyleCount:[...src.matchAll(/\bstyle=/g)].length,
      controls:[...src.matchAll(/(?:function\s+|window\.)([a-zA-Z_$][\w$]*(?:Modal|Sheet|Chart|Filter|Details)[\w$]*)/g)].map(m=>m[1])});
  }
  await fs.writeFile(path.join(out,'source-inventory.json'),JSON.stringify(inventory,null,2));
  const server=http.createServer(async(req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
      if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
      const data=await fs.readFile(file);
      const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
      res.writeHead(200,{'Content-Type':type}).end(data);
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
  const jobs=inventory.filter(x=>x.file.endsWith('.html')), observations=[];
  let cursor=0;
  try{
    await Promise.all(Array.from({length:3},async()=>{
      const context=await browser.createBrowserContext(),page=await context.newPage();
      await page.setRequestInterception(true);
      page.on('request',req=>req.url().startsWith(base)||/^(data:|blob:|about:)/.test(req.url())?req.continue():req.abort());
      page.on('dialog',dialog=>dialog.dismiss());
      let errors=[];page.on('pageerror',error=>errors.push(error.message));
      while(cursor<jobs.length){
        const job=jobs[cursor++];errors=[];
        try{
          await page.setViewport({width:390,height:844});
          await page.goto(base+'/'+job.file+'?theme=dark',{waitUntil:'domcontentloaded',timeout:15000});
          await page.addStyleTag({content:'*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;}'});
          await new Promise(resolve=>setTimeout(resolve,160));
          const variants=[];
          for(const width of [360,420])for(const theme of ['dark','light']){
            await page.setViewport({width,height:844});
            await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
            variants.push({width,theme,...await page.evaluate(inspect)});
          }
          observations.push({file:job.file,legacy:job.legacy,errors:[...errors],variants});
        }catch(error){observations.push({file:job.file,error:error.message,errors:[...errors]});}
        if(observations.length%12===0)console.log('Rendered '+observations.length+'/'+jobs.length+' HTML pages in four viewport/theme combinations');
      }
      await context.close();
    }));
    observations.sort((a,b)=>a.file.localeCompare(b.file));
    await fs.writeFile(path.join(out,'page-observations.json'),JSON.stringify(observations,null,2));
    console.log(JSON.stringify({sourceFiles:inventory.length,htmlFiles:inventory.filter(x=>x.file.endsWith('.html')).length,renderedPages:observations.length,variants:observations.reduce((n,x)=>n+(x.variants?.length||0),0),pageErrors:observations.filter(x=>x.errors?.length||x.error).map(x=>({file:x.file,error:x.error,errors:x.errors})),chartViolations:observations.flatMap(x=>(x.variants?.[0]?.charts||[]).filter(y=>!y.pie||!y.hasText||y.whiteSpace!=='nowrap').map(y=>({file:x.file,chart:y.id||y.cls}))),overflow:observations.filter(x=>x.variants?.some(y=>y.scrollIssues.some(z=>z.cls!=='phone-container'))).map(x=>x.file)},null,2));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
module.exports = {inspect, root, out};
if (require.main === module) main().catch(error=>{console.error(error);process.exitCode=1;});
