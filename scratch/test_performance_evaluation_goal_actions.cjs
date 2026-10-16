const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const puppeteer=require('puppeteer');
const url=file=>pathToFileURL(path.resolve(__dirname,'../modules/performance/options/'+file)).href;
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--allow-file-access-from-files','--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.goto(url('performance-evaluation-form.html')+'?evaluation=PE-2026-0012&theme=light',{waitUntil:'load'});
  await page.evaluate(()=>sessionStorage.removeItem('pq_performance_evaluation_preview_v1'));
  await page.reload({waitUntil:'load'});
  await page.click('[data-evaluation-details="goals"]');
  assert.equal(await page.$eval('#evaluationAdd',n=>n.hidden),false);
  assert.equal(await page.$$eval('#evaluationSectionItems .goal-plan-card-delete',n=>n.length),2);
  await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('#evaluationAdd')]);
  assert.equal(new URL(page.url()).searchParams.get('mode'),'add');
  assert.equal(await page.$eval('#evaluationItemTitle',n=>n.readOnly),false);
  assert.equal(await page.$eval('#evaluationItemWeightage',n=>n.readOnly),false);
  assert.equal(await page.$eval('#evaluationItemUpdate',n=>n.textContent.trim()),'Add Goal');
  await page.$eval('#evaluationItemTitle',n=>n.value='Build Team Capability');
  await page.$eval('#evaluationItemWeightage',n=>n.value='10');
  await page.$eval('#evaluationItemRating',n=>n.value='4');
  await page.$eval('#evaluationItemRemark',n=>n.value='Created from evaluation.');
  await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('#evaluationItemUpdate')]);
  assert.equal(await page.$$eval('#evaluationSectionItems .evaluation-summary-item',n=>n.length),3);
  await page.click('#evaluationSectionItems .evaluation-summary-item:last-child .goal-plan-card-delete');
  assert.equal(await page.$eval('#evaluationDeleteOverlay',n=>n.hidden),false);
  await page.click('#evaluationDeleteConfirm');
  assert.equal(await page.$$eval('#evaluationSectionItems .evaluation-summary-item',n=>n.length),2);
  await page.click('#evaluationBack');
  assert.equal(await page.$eval('#evaluationGoalsSummary',n=>n.textContent.trim()),'2 items');
  await page.click('[data-evaluation-details="competencies"]');
  assert.equal(await page.$eval('#evaluationAdd',n=>n.hidden),true);
  assert.equal(await page.$$eval('#evaluationSectionItems .goal-plan-card-delete',n=>n.length),0);
  console.log('PASS: Performance Evaluation goals can add/delete; competencies stay edit-only.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
