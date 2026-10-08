import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const page=await browser.newPage();await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle0'});
for(const width of [1024,768,390]){
await page.setViewport({width,height:950});
console.log('BEFORE',width,await page.evaluate(()=>{const b=document.querySelector('.mobile-menu'),r=b.getBoundingClientRect();return{cls:document.querySelector('.sidebar').className,menu:r.toJSON(),cover:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.outerHTML.slice(0,250)}}));
if(width<=768){await page.click('.mobile-menu');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));console.log('AFTER',await page.$eval('.sidebar',node=>node.className));await page.screenshot({path:'docs/verification/mobile-inspect-'+width+'.png'});await page.click('.sidebar-close');}
}
await browser.close();
