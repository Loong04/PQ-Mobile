const puppeteer = require('puppeteer');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await puppeteer.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--allow-file-access-from-files','--no-sandbox']});
  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    await page.setViewport({width:360,height:900});
    await page.goto(pathToFileURL(path.resolve(__dirname,'../modules/employee-career/options/team/history.html')).href+'?category=staff-exit&theme=light');
    await page.click('[data-exit-id="SE-2026-0007"]');
    await page.setViewport({width:360,height:640});
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    console.log(await page.evaluate(() => ['.phone-container','#teamExitDetailsOverlay','#teamExitDetailsOverlay .detail-popout-panel','#teamExitDetailsOverlay .detail-popout-body'].map(selector=>{
      const node=document.querySelector(selector), rect=node.getBoundingClientRect(),style=getComputedStyle(node);
      return {selector,top:rect.top,bottom:rect.bottom,height:rect.height,scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,cssHeight:style.height,maxHeight:style.maxHeight};
    })));
    await page.screenshot({path:path.join(__dirname,'staff-exit-details-light-360.png')});
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
