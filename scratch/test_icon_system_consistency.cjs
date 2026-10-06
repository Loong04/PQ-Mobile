const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');

function collectFiles(target, extensions, files = []) {
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) collectFiles(full, extensions, files);
    else if (extensions.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

const htmlExtension = new Set(['.html']);
const productHtmlFiles = [
  ...fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isFile() && htmlExtension.has(path.extname(entry.name)))
    .map(entry => path.join(root, entry.name)),
  ...collectFiles(path.join(root, 'modules'), htmlExtension)
].sort();
const cssBearingFiles = [
  ...productHtmlFiles,
  ...collectFiles(path.join(root, 'css'), new Set(['.css'])),
  ...collectFiles(path.join(root, 'modules'), new Set(['.css']))
];

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function loaderCoverageOffenders() {
  return productHtmlFiles.flatMap(file => {
    const source = fs.readFileSync(file, 'utf8');
    return /<script\b[^>]+src=(?:\x22|')[^\x22']*(?:components|icon-system)\.js(?:[?#][^\x22']*)?(?:\x22|')/i.test(source)
      ? []
      : [relative(file)];
  });
}

function dataSvgOffenders() {
  return cssBearingFiles.flatMap(file => {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    return lines.flatMap((line, index) => /data:image\/svg\+xml/i.test(line)
      ? [relative(file) + ':' + (index + 1)]
      : []);
  });
}

const optionPages = [
  { file: 'modules/claims/index.html', selector: '.claim-square-icon-wrap', minimum: 5 },
  { file: 'modules/attendance/index.html', selector: '.attendance-quick-icon', minimum: 5 },
  { file: 'modules/payroll/index.html', selector: '#scopeIndividualSection .opt-icon-wrap', minimum: 5 },
  { file: 'modules/project-task/index.html', selector: '.project-dashboard-quick-grid .project-option-icon', minimum: 5 },
  { file: 'modules/employee-career/index.html', selector: '.employee-career-option-icon', minimum: 4 },
  { file: 'modules/admin/index.html', selector: '.admin-option-icon', minimum: 5 },
  { file: 'modules/leave/index.html', selector: '.module-option-icon', minimum: 4 },
  { file: 'modules/me/index.html', selector: '.module-option-icon', minimum: 6 },
  { file: 'appdark.html', selector: '.recent-pills .recent-pill-icon', minimum: 3 },
  { file: 'applight.html', selector: '.recent-pills .recent-pill-icon', minimum: 3 },
  { file: 'team.html', selector: '.mgr-icon-box', minimum: 4 },
  { file: 'team-v2.html', selector: '.mgr-capsule-icon', minimum: 4 },
  { file: 'light.html', selector: '.quick-actions-grid .qa-icon-box', minimum: 4 }
];
const iconSystemSource = fs.readFileSync(path.join(root, 'js', 'icon-system.js'), 'utf8');
const mappedIconClasses = [...new Set(
  [...iconSystemSource.matchAll(/'(fa-[a-z0-9-]+)'/g)]
    .map(match => match[1])
    .filter(name => !['fa-solid', 'fa-regular', 'fa-brands', 'fa-', 'fa-grid-2'].includes(name))
)].sort();

async function waitForIconSystem(page) {
  await page.waitForFunction(() => Boolean(window.PeopleHcmIcons), { timeout: 3000 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function openProductPage(page, file) {
  await page.goto(pathToFileURL(file).href + '?theme=light&iconSystemTest=1', {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });
  await waitForIconSystem(page);
}

async function renderedGlyphs(page) {
  return page.evaluate(() => {
    const visualGlyph = /\p{Extended_Pictographic}|[\u00D7\u0B83\u2039\u203A\u2190-\u21FF\u25B2\u25BC\u2605\u2606\u2713-\u2718\u2794\u2795]/u;
    const skippedSelector = [
      'script', 'style', 'svg', 'canvas', 'template', 'noscript',
      '[data-chart]', '.chart', '.chart-container', '.chart-wrapper',
      '.chart-canvas', '.chart-legend', '[class*="chart-legend"]',
      '.staff-list-legend', '.staff-list-legend-name',
      '.apexcharts-canvas', '.highcharts-container',
      '[data-logo]', '.logo', '.app-logo', '.brand-logo', '.company-logo'
    ].join(',');

    function skipped(element) {
      return Boolean(element && element.closest(skippedSelector));
    }

    function label(element) {
      if (!element) return 'unknown';
      const id = element.id ? '#' + element.id : '';
      const classes = typeof element.className === 'string' && element.className.trim()
        ? '.' + element.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
      return element.tagName.toLowerCase() + id + classes;
    }

    const offenders = [];
    const walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!skipped(parent) && visualGlyph.test(node.nodeValue || '')) {
        offenders.push(label(parent) + ' text=' + JSON.stringify((node.nodeValue || '').trim().slice(0, 90)));
      }
    }

    document.querySelectorAll('[placeholder]').forEach(element => {
      const value = element.getAttribute('placeholder') || '';
      if (!skipped(element) && visualGlyph.test(value)) {
        offenders.push(label(element) + ' placeholder=' + JSON.stringify(value.slice(0, 90)));
      }
    });

    document.querySelectorAll('*').forEach(element => {
      if (skipped(element)) return;
      for (const pseudo of ['::before', '::after']) {
        const content = getComputedStyle(element, pseudo).content;
        if (content && content !== 'none' && content !== 'normal' && visualGlyph.test(content)) {
          offenders.push(label(element) + ' ' + pseudo + '=' + content.slice(0, 90));
        }
      }
    });

    const allowedVisualSelector = [
      '[data-logo]', '.logo-icon', '.logo', '.app-logo', '.brand-logo', '.company-logo',
      '[data-chart]', '.chart', '.chart-container', '.chart-wrapper', '.chart-canvas',
      '.chart-legend', '[class*="chart-legend"]', '.staff-list-legend', '.staff-list-legend-name',
      '[data-decorative]', '.decorative-visual', '.phone-hero-bg'
    ].join(',');
    document.querySelectorAll('button svg, a svg, [class*=icon] svg').forEach(svg => {
      if (!svg.closest(allowedVisualSelector)) {
        offenders.push(label(svg.parentElement) + ' contains a visible inline SVG UI icon');
      }
    });

    document.querySelectorAll('button i, a i, [class*=icon] i, [class*=option] i').forEach(icon => {
      if (
        !icon.closest(allowedVisualSelector)
        && !/\bfa-(?:solid|regular|brands)\b/.test(icon.className)
      ) {
        offenders.push(
          label(icon)
          + ' in ' + label(icon.parentElement)
          + ' is an icon without a Font Awesome style class: '
          + icon.outerHTML.slice(0, 140)
        );
      }
    });

    document.querySelectorAll('i.fa-solid, i.fa-regular, i.fa-brands').forEach(icon => {
      if (icon.closest(allowedVisualSelector)) return;
      const content = getComputedStyle(icon, '::before').content;
      if (!content || content === 'none' || content === 'normal' || content === '""') {
        offenders.push(label(icon) + ' has no rendered Font Awesome ::before content');
      }
    });

    document.querySelectorAll('select').forEach(select => {
      const associated = new Set();
      const addChevrons = element => {
        if (!element) return;
        if (element.matches?.('i.fa-chevron-down, .fa-chevron-down')) associated.add(element);
        element.querySelectorAll?.('i.fa-chevron-down, .fa-chevron-down').forEach(icon => associated.add(icon));
      };
      addChevrons(select.previousElementSibling);
      addChevrons(select.nextElementSibling);
      if (select.parentElement?.classList.contains('peoplehcm-select-wrap')) {
        addChevrons(select.parentElement);
        addChevrons(select.parentElement.previousElementSibling);
        addChevrons(select.parentElement.nextElementSibling);
      }
      if (associated.size > 1) {
        offenders.push(label(select) + ' has ' + associated.size + ' associated chevrons');
      }
    });
    return offenders.slice(0, 25);
  });
}

(async () => {
  const loaderOffenders = loaderCoverageOffenders();
  const svgOffenders = dataSvgOffenders();
  assert.deepEqual(
    loaderOffenders,
    [],
    'Product HTML missing PeopleHcmIcons loader coverage:\n' + loaderOffenders.join('\n')
  );
  assert.deepEqual(
    svgOffenders,
    [],
    'CSS data-URI SVG controls found:\n' + svgOffenders.join('\n')
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  const runtimeOffenders = [];
  const visualOffenders = [];
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.on('dialog', dialog => dialog.dismiss().catch(() => {}));
    await page.setViewport({ width: 390, height: 900 });

    for (const file of productHtmlFiles) {
      try {
        await openProductPage(page, file);
        const glyphs = await renderedGlyphs(page);
        if (glyphs.length) {
          runtimeOffenders.push(relative(file) + ':\n  ' + glyphs.join('\n  '));
        }
      } catch (error) {
        runtimeOffenders.push(relative(file) + ': ' + error.message);
      }
    }

    for (const item of optionPages) {
      await openProductPage(page, path.join(root, item.file));
      await page.evaluate(() => document.fonts.ready);
      const result = await page.$$eval(item.selector, nodes => nodes.map(node => {
        const icon = node.querySelector('i');
        const style = getComputedStyle(node);
        const before = icon ? getComputedStyle(icon, '::before') : null;
        const rgb = style.color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number) || [];
        const isPurple = rgb.length === 3
          && rgb[0] >= 90 && rgb[0] <= 180
          && rgb[2] >= 150 && rgb[2] > rgb[1];
        return {
          html: node.outerHTML.slice(0, 220),
          fontAwesome: Boolean(
            icon
            && /\bfa-(?:solid|regular|brands)\b/.test(icon.className)
            && before?.content !== 'none'
          ),
          isPurple,
          color: style.color
        };
      }));
      if (result.length < item.minimum) {
        visualOffenders.push(item.file + ': expected at least ' + item.minimum + ' option icons, found ' + result.length);
      }
      result.forEach((icon, index) => {
        if (!icon.fontAwesome) {
          visualOffenders.push(item.file + ' option ' + (index + 1) + ': not a rendered Font Awesome icon: ' + icon.html);
        }
        if (!icon.isPurple) {
          visualOffenders.push(item.file + ' option ' + (index + 1) + ': icon is ' + icon.color + ', expected purple');
        }
      });
    }

    const mappingFailures = await page.evaluate(iconClasses => {
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:0;top:0;z-index:-1';
      document.body.appendChild(host);
      const failures = iconClasses.filter(iconClass => {
        const icon = document.createElement('i');
        icon.className = 'fa-solid ' + iconClass;
        host.appendChild(icon);
        const content = getComputedStyle(icon, '::before').content;
        icon.remove();
        return !content || content === 'none' || content === 'normal' || content === '""';
      });
      host.remove();
      return failures;
    }, mappedIconClasses);
    mappingFailures.forEach(iconClass => {
      visualOffenders.push('js/icon-system.js mapping does not render in Font Awesome 6.4: ' + iconClass);
    });

    const dynamicSmoke = await page.evaluate(async () => {
      const host = document.createElement('div');
      host.id = 'peoplehcm-icon-system-smoke';
      const content = document.createElement('div');
      content.textContent = '\u{1F9FF} \u2192';
      host.appendChild(content);

      const legacyIcon = document.createElement('i');
      legacyIcon.textContent = '\u2715';
      host.appendChild(legacyIcon);

      const input = document.createElement('input');
      input.placeholder = '\u{1F50D} Search people';
      host.appendChild(input);

      const select = document.createElement('select');
      const option = document.createElement('option');
      option.textContent = '\u2705 Approved';
      select.appendChild(option);
      host.appendChild(select);
      document.body.appendChild(host);

      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const statusColors = [
        ['\u{1F534}', 'rgb(239, 68, 68)'],
        ['\u{1F7E1}', 'rgb(234, 179, 8)'],
        ['\u{1F7E2}', 'rgb(34, 197, 94)']
      ].map(item => {
        const icon = window.PeopleHcmIcons.create(item[0]);
        host.appendChild(icon);
        return { expected: item[1], actual: getComputedStyle(icon).color };
      });

      const result = {
        contentIcons: content.querySelectorAll('i.fa-solid, i.fa-regular, i.fa-brands').length,
        fallback: Boolean(content.querySelector('i.fa-icons')),
        arrow: Boolean(content.querySelector('i.fa-arrow-right')),
        legacyIcon: /\bfa-(?:solid|regular|brands)\b/.test(legacyIcon.className)
          && !legacyIcon.textContent.includes('\u2715'),
        placeholder: input.placeholder,
        option: option.textContent,
        statusColors
      };
      host.remove();
      return result;
    });

    if (dynamicSmoke.contentIcons !== 2 || !dynamicSmoke.fallback || !dynamicSmoke.arrow) {
      visualOffenders.push('Dynamic text glyphs were not converted to fallback and semantic Font Awesome icons');
    }
    if (!dynamicSmoke.legacyIcon) {
      visualOffenders.push('Dynamic legacy <i> glyph was not upgraded to a Font Awesome icon');
    }
    if (dynamicSmoke.placeholder !== 'Search people' || dynamicSmoke.option !== 'Approved') {
      visualOffenders.push('Dynamic placeholder/option glyphs were not stripped');
    }
    dynamicSmoke.statusColors.forEach(color => {
      if (color.actual !== color.expected) {
        visualOffenders.push('Semantic status color is ' + color.actual + ', expected ' + color.expected);
      }
    });
  } finally {
    await browser.close();
  }

  assert.deepEqual(
    runtimeOffenders,
    [],
    'Rendered visual glyphs or missing PeopleHcmIcons API found:\n' + runtimeOffenders.join('\n')
  );
  assert.deepEqual(
    visualOffenders,
    [],
    'Option icon consistency failures:\n' + visualOffenders.join('\n')
  );
  console.log(
    'PASS: ' + productHtmlFiles.length
    + ' product pages load PeopleHcmIcons with no rendered emoji/symbol icons; all '
    + optionPages.length
    + ' module option menus use rendered purple Font Awesome icons; CSS contains no data-URI SVG controls.'
  );
})().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
