const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 950, deviceScaleFactor: 1 });
      const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/index.html')).href + `?scope=individual&theme=${theme}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      assert.ok(await page.$('#employeeCareerDocumentStatus'), 'Individual dashboard needs My Document Status');
      assert.equal(await page.$eval('#employeeCareerDocumentStatusTitle', node => node.textContent), 'My Document Status');
      assert.deepEqual(await page.$$eval('.employee-career-status-card', nodes => nodes.map(node => [node.querySelector('strong').textContent, node.querySelector('.employee-career-status-name').textContent, node.querySelector('small').textContent])), [
        ['2', 'Submitted', 'In Review'], ['0', 'Resubmit', 'Needs Action'], ['14', 'Approved', 'Confirmed'], ['1', 'Rejected', 'Declined']
      ]);
      const boxes = await page.$$eval('.employee-career-status-card', nodes => nodes.map(node => ({ top: node.getBoundingClientRect().top, width: node.getBoundingClientRect().width })));
      assert.ok(boxes.every(box => Math.abs(box.top - boxes[0].top) < 1 && box.width > 60), 'Four cards fit in a single row');
      assert.equal(await page.$eval('.employee-career-content', node => node.scrollWidth > node.clientWidth), false);
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-document-status-${theme}-${width}.png`) });
      for (const status of ['submitted', 'resubmit', 'approved', 'rejected']) {
        await page.click(`[data-document-status="${status}"]`);
        await page.waitForFunction(() => location.pathname.endsWith('/employee-career/options/history.html'));
        assert.equal(new URL(page.url()).searchParams.get('theme'), theme);
        assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'History');
        await page.click('#careerHistoryBack');
        await page.waitForSelector('#employeeCareerDocumentStatus', { visible: true });
        assert.equal(await page.$eval('#employeeCareerTabIndividual', node => node.getAttribute('aria-selected')), 'true');
      }
      await page.click('#employeeCareerTabTeam');
      assert.equal(await page.$eval('#employeeCareerDocumentStatus', node => node.hidden), true, 'My documents belongs to Individual');
      assert.equal(await page.$$eval('#employeeCareerOptions .employee-career-option', nodes => nodes.length), 6, 'Team quick options retained');
      await page.click('#employeeCareerTabIndividual');
      assert.equal(await page.$eval('#employeeCareerDocumentStatus', node => node.hidden), false);
      assert.deepEqual(await page.$$eval('#employeeCareerOptions .employee-career-option-title', nodes => nodes.map(node => node.textContent.trim())), ['Feedback', 'Whereabout', 'My Event', 'History']);
      await page.goto(url.replace('scope=individual', 'scope=team'), { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#employeeCareerDocumentStatus', node => node.hidden), true, 'Direct Team navigation hides my status');
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: photo status cards, all four History links, theme, return and scope switching`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
