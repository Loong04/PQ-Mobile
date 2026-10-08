import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
const page=await browser.newPage();await page.setViewport({width:1440,height:1080});
page.on('framenavigated',frame=>console.log('NAV',frame===page.mainFrame()?'root':'frame',frame.url()));
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle0'});
await page.keyboard.down('Control');await page.keyboard.press('k');await page.keyboard.up('Control');await page.waitForSelector('.command-input input');await page.type('.command-input input','work plan');await page.keyboard.press('Enter');await page.waitForSelector('.business-frame');
for(let i=0;i<5;i++){
 const frame=page.frames().find(frame=>frame.url().includes('/workspace/'));
 console.log('STATE',i,await page.evaluate(()=>({hash:location.hash,loading:!!document.querySelector('.frame-loading')})),frame?await frame.evaluate(()=>({url:location.href,ready:document.readyState,count:document.querySelectorAll('input,select,textarea').length,text:document.body?.innerText.slice(0,70)})):null);
 await new Promise(resolve=>setTimeout(resolve,250));
}
await page.goto('http://127.0.0.1:4173/#/page/'+encodeURIComponent('modules/leave/index.html'),{waitUntil:'networkidle0'});
let frame=page.frames().find(frame=>frame.url().includes('/workspace/'));
console.log('LEAVE before',frame.url());await frame.evaluate(()=>location.href='options/apply.html');
await page.waitForFunction(()=>document.querySelector('.business-frame')?.contentWindow?.location.pathname.endsWith('/leave.html'));
frame=page.frames().find(frame=>frame.url().includes('/leave.html'));
console.log('LEAVE after',await frame.evaluate(()=>({url:location.href,action:typeof window.showLeaveSection,rect:document.querySelector('#viewApplyLeave')?.getBoundingClientRect().toJSON(),display:document.querySelector('#viewApplyLeave')?.getAttribute('style'),visible:[...document.querySelectorAll('[id^="view"]')].filter(n=>n.getBoundingClientRect().height>0).map(n=>[n.id,n.getAttribute('style')])})));
await browser.close();
