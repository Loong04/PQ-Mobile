const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');
const categories = ['personal','education','family','contact','work','finance','career','competency','performance','training','compliance','assets','letters'];
(async () => {
  const browser = await puppeteer.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--allow-file-access-from-files']});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.setViewport({width:420,height:980});
    const fields = () => page.$$eval('#meMainScroll .profile-field', nodes => nodes.map(node=>({
      section:node.closest('section').id,
      label:node.querySelector('dt').textContent.trim(),
      value:node.querySelector('dd').textContent.replace(/\s+/g,' ').trim().toLowerCase()
    })).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
    await page.goto('file:///C:/Users/loong/PQ-Mobile/scratch/profile-polish-before.html',{waitUntil:'load'});
    const beforeFields = (await fields()).map(field=>{
      if(field.section==='bento-work' && field.label==='Department') return {...field,value:'human resource'};
      if(field.section==='bento-work' && field.label==='Position') return {...field,value:'group hr manager'};
      return field;
    }).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    errors.length=0;
    for(const theme of ['light','dark']) {
      for(const width of [320,360,420]) {
        await page.setViewport({width,height:980});
        await page.goto('file:///C:/Users/loong/PQ-Mobile/me.html?theme='+theme,{waitUntil:'load'});
        await page.evaluate(()=>document.fonts.ready);
        await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,350)));
        assert.deepEqual(await fields(),beforeFields,'All fields match the photos; only the two Work values were corrected');
        assert.deepEqual(await page.$$eval('#meMainScroll > .profile-section',nodes=>nodes.filter(node=>!node.hidden).map(node=>node.id)),categories.map(category=>'bento-'+category),'All displays the entire profile in photo order');
        assert.equal(await page.$eval('.me-jump-pill.active',node=>node.dataset.category),'all');
        assert.equal(await page.$eval('#meMainScroll',node=>node.scrollWidth>node.clientWidth+1),false,'All view fits the screen');
        if(width===420) await page.screenshot({path:'scratch/profile-complete-'+theme+'-all.png'});
        let headerCount=0;
        for(const category of categories) {
          await page.$eval('.me-jump-pill[aria-controls="bento-'+category+'"]',node=>node.click());
          await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
          const layout = await page.evaluate(()=>{
            const main=document.getElementById('meMainScroll');
            const bounds=main.getBoundingClientRect();
            const section=[...main.querySelectorAll(':scope > .profile-section')].filter(node=>!node.hidden);
            const panels=[...section[0].querySelectorAll('.profile-panel')];
            const expected=getComputedStyle(document.querySelector('.me-profile-header')).backgroundImage;
            const heads=panels.map(panel=>panel.querySelector(':scope > .profile-group-title, :scope > .profile-section-heading, :scope > .profile-subsection-heading'));
            return {
              visible:section.length,
              nested:panels.some(panel=>panel.querySelector('.profile-panel')),
              gutters:panels.map(panel=>{const box=panel.getBoundingClientRect();return [box.left-bounds.left,bounds.right-box.right];}),
              overflowing:[...section[0].querySelectorAll('.profile-panel,dt,dd,.profile-record-title,.profile-search')].filter(node=>node.scrollWidth>node.clientWidth+1).map(node=>node.textContent.trim()),
              headers:heads.length,
              allMatching:heads.every(node=>node && getComputedStyle(node).backgroundImage===expected && getComputedStyle(node).color==='rgb(255, 255, 255)')
            };
          });
          assert.equal(layout.visible,1);
          assert.equal(layout.nested,false);
          assert.deepEqual(layout.overflowing,[],theme+' '+width+' '+category+' has no horizontal overflow');
          for(const gutters of layout.gutters) assert.deepEqual(gutters,[14,14]);
          assert.equal(layout.allMatching,true,'Every card header shares My Profile purple gradient and white text');
          headerCount+=layout.headers;
          if(category==='finance') {
            await page.$eval('.profile-account-toggle',node=>node.click());
            assert.equal(await page.$eval('#cimbNumDisplay',node=>node.textContent.replace(/\s/g,'')),'10447856855254');
            assert.equal(await page.$eval('.profile-account',node=>node.scrollWidth>node.clientWidth+1),false);
            await page.$eval('.profile-account-toggle',node=>node.click());
          }
          if(width===420) {
            await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,350)));
            await page.screenshot({path:'scratch/profile-complete-'+theme+'-'+category+'.png'});
          }
        }
        assert.equal(headerCount,22);
        console.log('PASS: '+theme+' '+width+'px, default All in photo order, 13 category filters, 22 matching headers, retained photo fields, no overflow.');
      }
    }
    await page.$eval('#scrollTopBtn',node=>node.click());
    assert.equal(await page.$eval('.me-jump-pill.active',node=>node.getAttribute('aria-controls')),'bento-letters');
    assert.equal(await page.$eval('#meMainScroll',node=>node.scrollTop),0);
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
