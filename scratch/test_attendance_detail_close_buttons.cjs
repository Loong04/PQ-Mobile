const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const attendancePages = [
  'attendance.html',
  'clocking-history.html',
  'feedback-history.html',
  'history.html',
  'hours-summary.html',
  'overtime.html',
  'staff-hours-summary.html',
  'work-hour-violation.html'
];

async function inspectCloseButtons(page, file) {
  await page.goto(pathToFileURL(path.resolve(__dirname, `../modules/attendance/options/${file}`)).href, { waitUntil: 'networkidle0' });
  const buttons = await page.$$eval('.detail-popout-close', nodes => nodes.map(node => {
    const icon = node.querySelector('.fa-xmark');
    const buttonStyle = getComputedStyle(node);
    const iconStyle = icon ? getComputedStyle(icon) : null;
    return {
      width: parseFloat(buttonStyle.width),
      height: parseFloat(buttonStyle.height),
      decoration: node.classList.contains('detail-popout-decoration'),
      iconDisplay: iconStyle?.display || null,
      iconFontSize: parseFloat(iconStyle?.fontSize || 0)
    };
  }));

  assert.ok(buttons.length > 0, `${file} should expose at least one shared details close button`);
  for (const button of buttons) {
    assert.ok(button.width >= 30 && button.height >= 30, `${file} close button should be at least 30x30, received ${button.width}x${button.height}`);
    assert.equal(button.decoration, false, `${file} close button must not be classified as decoration`);
    assert.notEqual(button.iconDisplay, 'none', `${file} close icon should be visible`);
    assert.ok(button.iconFontSize > 0, `${file} close icon should have a visible font size`);
  }
}

async function verifyCloseInteraction(page, file, openExpression) {
  await page.goto(pathToFileURL(path.resolve(__dirname, `../modules/attendance/options/${file}`)).href, { waitUntil: 'networkidle0' });
  await page.evaluate(expression => Function(expression)(), openExpression);
  await page.waitForSelector('#modal-attendance-details', { visible: true });
  await page.click('#modal-attendance-details .detail-popout-close');
  await page.waitForSelector('#modal-attendance-details', { hidden: true });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    for (const file of attendancePages) await inspectCloseButtons(page, file);
    await verifyCloseInteraction(page, 'hours-summary.html', "openListDetails('Scheduled Work Days'); openAttendanceDetailsByIndex(0)");
    await verifyCloseInteraction(page, 'staff-hours-summary.html', "openListDetails('Scheduled Work Days'); openStaffDailyDetails(0); openAttendanceDetailsByIndex(0)");
    console.log('PASS: Attendance details close buttons are visible, consistent and functional.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
