const fs = require('node:fs');
const puppeteer = require('puppeteer');
const original = fs.readFileSync('css/me-profile-details.css', 'utf8');
const neutral = {
  light: { canvas: '#f3f4f6', panel: '#ffffff', rule: '#e9ecf0', label: '#646c78', ink: '#202630', accent: '#4e5a6b', tint: '#edf0f4', edge: 'rgba(32,38,48,.06)', shadow: '0 5px 18px -10px rgba(32,38,48,.13)' },
  dark: { canvas: '#111419', panel: '#1e232b', rule: '#323943', label: '#adb6c3', ink: '#eef1f6', accent: '#c9d2df', tint: '#2a313c', edge: 'rgba(226,232,240,.06)', shadow: '0 5px 18px -10px rgba(0,0,0,.3)' }
};
const forest = {
  light: { canvas: '#f4f5ef', panel: '#ffffff', rule: '#e8ede6', label: '#667467', ink: '#24392e', accent: '#28684e', tint: '#edf3e9', edge: 'rgba(36,57,46,.06)', shadow: '0 5px 18px -10px rgba(36,57,46,.13)' },
  dark: { canvas: '#0f1915', panel: '#1b2a22', rule: '#304537', label: '#aebfb2', ink: '#ecf2e9', accent: '#b2d4b8', tint: '#2b4031', edge: 'rgba(214,233,213,.06)', shadow: '0 5px 18px -10px rgba(0,0,0,.3)' }
};
function recolor(palette) {
  let index = 0;
  return original.replace(/(#meMainScroll\.profile-details\s*\{)([^]*?)(\n\})/g, (all, open, body, close) => {
    const colors = palette[index++ === 0 ? 'light' : 'dark'];
    return open + body.replace(/--profile-(canvas|panel|rule|label|ink|accent|tint|edge|shadow):[^;]+;/g, (_, token) => '--profile-' + token + ': ' + colors[token] + ';') + close;
  });
}
const options = { neutral: recolor(neutral), forest: recolor(forest) };
const forestChrome = `
.phone-container { --purple-primary:#28684e; --purple-border:#c5dbcb; --purple-subtle:#edf3e9; --nav-item-active:#28684e; }
.cal-top-header.me-profile-header { background:linear-gradient(115deg,#153f35,#2e6550); }
.me-profile-header .me-pass-avatar { background:#d7e9d8; color:#214f3e; border-color:rgba(255,255,255,.35); }
.me-jump-pill.active, .me-jump-pill:hover { background:#28684e; box-shadow:0 4px 12px rgba(40,104,78,.15); }
.nav-fab { background:#28684e !important; box-shadow:0 6px 18px rgba(40,104,78,.22) !important; }
`;
fs.writeFileSync('scratch/profile-color-neutral.css', options.neutral);
fs.writeFileSync('scratch/profile-color-forest.css', options.forest + forestChrome);

(async () => {
  const browser = await puppeteer.launch({headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--allow-file-access-from-files']});
  try {
    const page = await browser.newPage();
    await page.setViewport({width:420,height:980});
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    for (const name of ['neutral','forest']) {
      await page.goto('file:///C:/Users/loong/PQ-Mobile/me.html?theme=light',{waitUntil:'load'});
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({content:options[name] + (name === 'forest' ? forestChrome : '')});
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve,400)));
      await page.screenshot({path:'scratch/profile-color-option-'+name+'.png'});
    }
    console.log('Saved two color-only previews; production colors are unchanged.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
