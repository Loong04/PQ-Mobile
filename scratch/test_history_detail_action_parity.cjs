const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const requested = (process.argv.find(arg => arg.startsWith('--only=')) || '').split('=')[1] || '';

async function actionLabels(page, selector) {
  return page.$$eval(`${selector} .history-detail-action`, nodes => nodes.map(node => node.textContent.trim()));
}

async function assertPurpleActions(page, selector) {
  const state = await page.$eval(selector, node => {
    const footer = getComputedStyle(node);
    const buttons = [...node.querySelectorAll('.history-detail-action')];
    return {
      footer: {
        display: footer.display,
        justifyContent: footer.justifyContent,
        gap: footer.gap
      },
      buttons: buttons.map(button => {
        const style = getComputedStyle(button);
        return {
          backgroundImage: style.backgroundImage,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          color: style.color,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
        };
      }),
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    };
  });

  assert.equal(state.footer.display, 'flex');
  assert.equal(state.footer.justifyContent, 'flex-end');
  assert.equal(state.footer.gap, '8px');
  assert.ok(state.buttons.length > 0);
  state.buttons.forEach(button => {
    assert.match(button.backgroundImage, /linear-gradient\(135deg, rgb\(124, 58, 237\)(?: 0%)?, rgb\(109, 40, 217\)(?: 100%)?\)/);
    assert.equal(button.borderRadius, '20px');
    assert.match(button.boxShadow, /rgba\(124, 58, 237,/);
    assert.equal(button.color, 'rgb(255, 255, 255)');
    assert.equal(button.fontSize, '12px');
    assert.equal(button.fontWeight, '700');
    assert.deepEqual(button.padding, ['8px', '16px', '8px', '16px']);
  });
  assert.ok(state.scrollWidth <= state.viewportWidth + 1, 'Detail actions must not overflow the viewport');
}

async function runStyle(browser) {
  for (const theme of ['light', 'dark']) {
    for (const width of [360, 420]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 760 });
      await page.setContent(`<!doctype html><html data-theme=${theme}><body>
        <main style=width:min(100%,420px);margin:auto>
          <footer id=testActions class=history-detail-actions>
            <button type=button class=history-detail-action>Submit</button>
            <button type=button class=history-detail-action>Cancel</button>
          </footer>
        </main>
      </body></html>`);
      await page.addStyleTag({ path: path.join(root, 'css/detail-popout.css') });
      await new Promise(resolve => setTimeout(resolve, 250));
      assert.deepEqual(await actionLabels(page, '#testActions'), ['Submit', 'Cancel']);
      await assertPurpleActions(page, '#testActions');
      await page.close();
    }
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    if (!requested || requested === 'style') await runStyle(browser);
    else throw new Error(`Parity case not implemented yet: ${requested}`);
  } finally {
    await browser.close();
  }
  console.log(`PASS: History detail action parity${requested ? ` (${requested})` : ''}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
