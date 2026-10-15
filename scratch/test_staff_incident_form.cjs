const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const puppeteer=require('puppeteer');
const url=(file,theme)=>pathToFileURL(path.resolve(__dirname,'../modules/performance/'+file)).href+'?scope=team&theme='+theme;
(async()=>{
  const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--allow-file-access-from-files','--no-sandbox']});
  try{
    for(const theme of ['light','dark'])for(const width of [360,420]){
      const page=await browser.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
      await page.setRequestInterception(true);page.on('request',request=>/^https?:/.test(request.url())?request.abort():request.continue());await page.setViewport({width,height:844});
      await page.goto(url('index.html',theme),{waitUntil:'load'});
      assert.equal(await page.$eval('[data-option-id="staff-incident"]',node=>node.tagName),'A','Staff Incident opens its implemented form');
      await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('[data-option-id="staff-incident"]')]);
      assert.ok(page.url().includes('/options/staff-incident.html'));assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
      assert.equal(await page.$eval('#staffIncidentSubmit span',node=>node.textContent.trim()),'Save');
      assert.ok(await page.$eval('#staffIncidentSubmit i',node=>node.classList.contains('fa-floppy-disk')),'Save uses the standard save icon');
      assert.deepEqual(await page.$$eval('#staffIncidentForm label',nodes=>nodes.map(node=>node.textContent.replace(/\s*\*\s*$/,'').trim())),['Employee','Name','Position','Incident Date','Incident Type','Action Type','Value / Measure','Remarks']);
      assert.equal(await page.$eval('#staffIncidentEmployee option:first-child',node=>node.textContent.trim()),'Select Employee');
      assert.equal(await page.$eval('#staffIncidentName',node=>node.readOnly),true);assert.equal(await page.$eval('#staffIncidentPosition',node=>node.readOnly),true);
      assert.equal(await page.$eval('#staffIncidentActionType',node=>node.disabled),true);
      assert.ok(await page.$('#staffIncidentForm .employee-career-form-card'),'Form reuses the standard card');
      assert.equal(await page.$eval('.employee-career-form-card',node=>getComputedStyle(node).borderRadius),'24px');
      const original=await page.evaluate(()=>JSON.stringify(window.PERFORMANCE_INCIDENT_HIGHLIGHT_DATA));
      await page.$eval('#staffIncidentForm',form=>form.requestSubmit());
      assert.equal(await page.$eval('#staffIncidentError',node=>node.hidden),false);assert.equal(await page.evaluate(()=>document.activeElement.id),'staffIncidentEmployee');
      for(const [id,name,position]of [['EBB01','Alex Tan','Account Executive'],['EBB02','Daniel Wong','Product Designer'],['EBB03','Nur Izzati','Finance Analyst']]){
        await page.select('#staffIncidentEmployee',id);assert.equal(await page.$eval('#staffIncidentName',node=>node.value),name);assert.equal(await page.$eval('#staffIncidentPosition',node=>node.value),position);
      }
      await page.select('#staffIncidentEmployee','');assert.equal(await page.$eval('#staffIncidentName',node=>node.value),'');assert.equal(await page.$eval('#staffIncidentPosition',node=>node.value),'');
      await page.select('#staffIncidentEmployee','EBB01');
      await page.$eval('#staffIncidentForm',form=>form.requestSubmit());assert.equal(await page.evaluate(()=>document.activeElement.id),'staffIncidentDate');
      await page.$eval('#staffIncidentDate',node=>{node.value='2026-10-14';});
      await page.$eval('#staffIncidentForm',form=>form.requestSubmit());assert.equal(await page.evaluate(()=>document.activeElement.id),'staffIncidentType');
      await page.select('#staffIncidentType','Attendance');await page.select('#staffIncidentActionType','Warning');
      await page.select('#staffIncidentType','Commendation');assert.equal(await page.$eval('#staffIncidentActionType',node=>node.value),'','Changing type clears incompatible action');
      await page.$eval('#staffIncidentForm',form=>form.requestSubmit());assert.equal(await page.evaluate(()=>document.activeElement.id),'staffIncidentActionType');
      await page.select('#staffIncidentActionType','Recognition');
      await page.$eval('#staffIncidentForm',form=>form.requestSubmit());assert.equal(await page.evaluate(()=>document.activeElement.id),'staffIncidentValueMeasure');
      await page.evaluate(()=>{document.getElementById('staffIncidentDate').value='2026-10-14';document.getElementById('staffIncidentValueMeasure').value='1 completed handover';document.getElementById('staffIncidentRemarks').value='Completed early.\nPrepared the notes.';});
      const file=path.resolve(__dirname,'../assets/performance/handover-notes.txt');
      const [chooser]=await Promise.all([page.waitForFileChooser(),page.click('[data-file-picker="staffIncidentFiles"]')]);await chooser.accept([file]);
      assert.equal(await page.$$eval('#staffIncidentAttachments .form-attachment-item',nodes=>nodes.length),1);
      assert.equal(await page.$eval('#staffIncidentFiles',node=>node.value),'','File input resets for reselection');
      await(await page.$('#staffIncidentFiles')).uploadFile(file);assert.equal(await page.$$eval('#staffIncidentAttachments .form-attachment-item',nodes=>nodes.length),1,'Repeated selection keeps a single copy');
      const [camera]=await Promise.all([page.waitForFileChooser(),page.click('[data-file-picker="staffIncidentCamera"]')]);await camera.accept([path.resolve(__dirname,'../assets/img/map_placeholder.jpg')]);
      assert.equal(await page.$eval('#staffIncidentCamera',node=>node.getAttribute('capture')),'environment');
      assert.equal(await page.$$eval('#staffIncidentAttachments .form-attachment-item',nodes=>nodes.length),2);
      await page.click('#staffIncidentAttachments .form-attachment-item:last-child .form-attachment-remove');assert.equal(await page.$$eval('#staffIncidentAttachments .form-attachment-item',nodes=>nodes.length),1);
      await page.evaluate(()=>window.addEventListener('staffincident:ready',event=>{
        window.staffIncidentCaptured={...event.detail,attachments:event.detail.attachments.map(file=>({name:file.name,size:file.size,isFile:file instanceof File}))};
      }));
      await page.$eval('#staffIncidentName',node=>{node.value='Tampered';});
      await page.click('#staffIncidentSubmit');
      assert.deepEqual(await page.evaluate(()=>({...window.staffIncidentCaptured,attachments:window.staffIncidentCaptured.attachments.map(file=>({name:file.name,isFile:file.isFile}))})),{empNo:'EBB01',name:'Alex Tan',position:'Account Executive',incidentDate:'2026-10-14',incidentType:'Commendation',incidentAction:'Recognition',measureValue:'1 completed handover',remarks:'Completed early.\nPrepared the notes.',attachments:[{name:'handover-notes.txt',isFile:true}]});
      assert.equal(await page.$eval('#staffIncidentStatus',node=>node.textContent),'Staff incident saved successfully.');
      assert.equal(await page.evaluate(()=>JSON.stringify(window.PERFORMANCE_INCIDENT_HIGHLIGHT_DATA)),original,'Preparing form does not silently change existing incidents');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.ok(await page.$eval('main',node=>node.scrollWidth<=node.clientWidth+1));
      await page.$eval('main',node=>{node.scrollTop=0;});await page.screenshot({path:path.join(__dirname,`staff-incident-form-top-${theme}-${width}.png`)});
      await page.$eval('main',node=>{node.scrollTop=node.scrollHeight;});await page.screenshot({path:path.join(__dirname,`staff-incident-form-bottom-${theme}-${width}.png`)});
      await page.setViewport({width,height:568});
      await page.$eval('main',node=>{node.scrollTop=node.scrollHeight;});
      assert.ok(await page.$eval('#staffIncidentSubmit',node=>{const rect=node.getBoundingClientRect();return rect.top>=0&&rect.bottom<=innerHeight-70;}),'Save stays reachable above bottom navigation');
      await page.click(`[data-set-theme="${theme==='light'?'dark':'light'}"]`);assert.ok(await page.$eval('#staffIncidentBack',node=>node.href.includes('theme='+document.documentElement.dataset.theme)));
      await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('#staffIncidentCancel')]);assert.equal(await page.$eval('#performanceTeamPanel',node=>node.hidden),false);
      assert.deepEqual(errors,[]);await page.close();console.log(`PASS: Staff Incident consistent form, identity, dependent actions, attachments and validation; ${theme} ${width}px`);
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
