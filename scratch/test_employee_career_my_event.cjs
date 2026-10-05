const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const puppeteer = require('puppeteer');
const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/individual/my-event.html')).href;

(async () => {
  const browser = await puppeteer.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--no-sandbox','--allow-file-access-from-files']});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.evaluateOnNewDocument(() => {
      window.MY_EVENT_RECORDS = [
        {eventType:'Training', date:'2026-08-10', days:4},
        {eventType:'Meeting', date:'2026-08-27', days:1},
        {eventType:'Training', date:'2026-09-07', days:1}
      ];
    });
    const apply = async (start, end, eventType) => {
      await page.click('#myEventFilterTrigger');
      await page.evaluate(({start, end, eventType}) => {
        document.getElementById('myEventStartDate').value = start;
        document.getElementById('myEventEndDate').value = end;
        document.getElementById('myEventType').value = eventType;
        document.getElementById('myEventEndDate').dispatchEvent(new Event('input', {bubbles:true}));
      }, {start, end, eventType});
      await page.click('#myEventApplyFilter');
    };
    for (const theme of ['light','dark']) {
      await page.setViewport({width:390,height:950});
      await page.goto(pageUrl + '?theme=' + theme, {waitUntil:'networkidle0'});
      assert.deepEqual(await page.$$eval('#myEventTable th', nodes => nodes.map(node => node.innerText)), ['Event Type','Date','Days']);
      assert.equal(await page.$$eval('#myEventTable tbody tr', nodes => nodes.length), 3);
      await apply('2026-08-12', '2026-08-12', 'Training');
      assert.equal(await page.$eval('#myEventFilterOverlay', node => node.hidden), true);
      assert.deepEqual(await page.$$eval('#myEventTable tbody td', nodes => nodes.map(node => node.innerText)), ['Training','10 Aug 2026','4'], 'A date within a multi-day event matches inclusively');
      await apply('2026-08-01', '2026-08-31', 'Meeting');
      assert.deepEqual(await page.$$eval('#myEventTable tbody td', nodes => nodes.map(node => node.innerText)), ['Meeting','27 Aug 2026','1']);
      await page.click('#myEventFilterTrigger');
      await page.evaluate(() => { document.getElementById('myEventType').value = 'Training'; });
      await page.click('#myEventCloseFilter');
      await page.click('#myEventFilterTrigger');
      assert.equal(await page.$eval('#myEventType', node => node.value), 'Meeting', 'Cancelling restores the applied filter');
      await page.evaluate(() => {
        document.getElementById('myEventStartDate').value = '2026-09-07';
        document.getElementById('myEventEndDate').value = '2026-08-01';
        document.getElementById('myEventEndDate').dispatchEvent(new Event('input', {bubbles:true}));
      });
      await page.click('#myEventApplyFilter');
      assert.equal(await page.$eval('#myEventFilterOverlay', node => node.hidden), false);
      assert.equal(await page.$eval('#myEventEndDate', node => node.validity.valid), false);
      await page.click('#myEventResetFilter');
      await page.click('#myEventApplyFilter');
      assert.equal(await page.$$eval('#myEventTable tbody tr', nodes => nodes.length), 3);
      await apply('2027-01-01', '2027-01-31', '');
      assert.equal(await page.$eval('#myEventTable tbody', node => node.innerText.trim()), 'No events found');
      for (const width of [360,390,450]) {
        await page.setViewport({width,height:950});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true);
        await page.click('#myEventFilterTrigger');
        assert.deepEqual(await page.$$eval('#myEventFilterForm label', nodes => nodes.map(node => node.innerText)), ['Start Date','End Date','Event Type']);
        assert.equal(await page.$eval('.employee-career-content', node => node.inert), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.$eval('#myEventFilterOverlay', node => node.hidden), true);
        assert.equal(await page.$eval('.employee-career-content', node => node.inert), false);
      }
      await page.setViewport({width:390,height:950});
      await apply('', '', '');
      await page.screenshot({path:path.resolve(__dirname, 'employee_career_my_event_'+theme+'.png')});
      await page.click('#myEventFilterTrigger');
      await page.screenshot({path:path.resolve(__dirname, 'employee_career_my_event_filter_'+theme+'.png')});
      await page.keyboard.press('Escape');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: My Event three-column table; date/type filtering, multi-day boundaries, validation, cancel/reset/empty states and filter accessibility in both themes at three widths.');
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
