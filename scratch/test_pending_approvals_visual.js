const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });

  const filePath = 'file:///' + path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/');
  console.log('Navigating to:', filePath);
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // Wait for pending queue to render
  await page.waitForSelector('#teamApprovalsQueue pending-approval-card', { timeout: 5000 });

  // 1. Screenshot of All Pending Approvals
  await page.screenshot({ path: path.join(__dirname, 'pending_approvals_all.png') });
  console.log('Saved pending_approvals_all.png');

  // 2. Click Advance Pill Tab
  const filterPills = await page.$$('.filter-pill');
  let advancePill = null;
  let expensePill = null;
  for (const pill of filterPills) {
    const text = await page.evaluate(el => el.textContent.trim(), pill);
    if (text === 'Advance') advancePill = pill;
    if (text === 'Expense') expensePill = pill;
  }

  if (advancePill) {
    console.log('Clicking Advance tab...');
    await advancePill.click();
    await new Promise(r => setTimeout(r, 600));

    const countText = await page.$eval('#teamPendingCountBadge', el => el.textContent.trim());
    console.log('Advance Pending Count:', countText);

    await page.screenshot({ path: path.join(__dirname, 'pending_approvals_advance.png') });
    console.log('Saved pending_approvals_advance.png');

    // Open 3-dots menu on the first Advance card
    const firstThreeDots = await page.$('#teamApprovalsQueue .three-dots-btn');
    if (firstThreeDots) {
      await firstThreeDots.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(__dirname, 'pending_advance_threedots.png') });
      console.log('Saved pending_advance_threedots.png');

      // Click "View Details"
      const viewDetailsBtn = await page.$('button[onclick*="triggerClaimViewDetails"]');
      if (viewDetailsBtn) {
        await viewDetailsBtn.click();
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: path.join(__dirname, 'pending_advance_details_modal.png') });
        console.log('Saved pending_advance_details_modal.png');

        // Close details modal
        const closeBtn = await page.$('#claimDetailsModalOverlay .sheet-close-btn');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  }

  // 3. Click Expense Pill Tab
  if (expensePill) {
    console.log('Clicking Expense tab...');
    await expensePill.click();
    await new Promise(r => setTimeout(r, 600));

    const countText = await page.$eval('#teamPendingCountBadge', el => el.textContent.trim());
    console.log('Expense Pending Count:', countText);

    await page.screenshot({ path: path.join(__dirname, 'pending_approvals_expense.png') });
    console.log('Saved pending_approvals_expense.png');

    // Open 3-dots menu on the first Expense card
    const firstThreeDots = await page.$('#teamApprovalsQueue .three-dots-btn');
    if (firstThreeDots) {
      await firstThreeDots.click();
      await new Promise(r => setTimeout(r, 500));

      // Click "View Details"
      const viewDetailsBtn = await page.$('button[onclick*="triggerClaimViewDetails"]');
      if (viewDetailsBtn) {
        await viewDetailsBtn.click();
        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({ path: path.join(__dirname, 'pending_expense_details_modal.png') });
        console.log('Saved pending_expense_details_modal.png');

        const closeBtn = await page.$('#claimDetailsModalOverlay .sheet-close-btn');
        if (closeBtn) {
          await closeBtn.click();
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }
  }

  // 4. Capture Benefit, Medical, OT, and Travel tabs
  for (const t of ['Benefit', 'Medical', 'OT', 'Travel']) {
    const pills = await page.$$('.filter-pill');
    for (const pill of pills) {
      const text = await page.evaluate(el => el.textContent.trim(), pill);
      if (text === t) {
        await pill.click();
        await new Promise(r => setTimeout(r, 400));
        await page.screenshot({ path: path.join(__dirname, 'pending_approvals_' + t.toLowerCase() + '.png') });
        console.log('Saved pending_approvals_' + t.toLowerCase() + '.png');
        break;
      }
    }
  }

  await browser.close();
  console.log('Visual verification complete!');
}

run().catch(err => {
  console.error('Error running visual test:', err);
  process.exit(1);
});
