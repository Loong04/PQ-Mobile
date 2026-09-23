import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 430, "height": 950})
        
        filepath = os.path.abspath("modules/attendance/options/shift-plan.html")
        await page.goto(f"file:///{filepath}")
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(300)
        
        # 1. Main Staff Screen (Change shift mode)
        await page.screenshot(path=os.path.abspath("scratch/shift_plan_main.png"))
        print("Captured shift_plan_main.png")

        # 2. Open Review Changes Modal
        review_btn = await page.query_selector("#bottomMainActionBtn")
        if review_btn:
            await review_btn.click()
            await page.wait_for_timeout(400)
            await page.screenshot(path=os.path.abspath("scratch/shift_plan_review_modal.png"))
            print("Captured shift_plan_review_modal.png")

        # Close modal
        close_btn = await page.query_selector("#reviewChangesModal .sheet-close-btn")
        if close_btn:
            await close_btn.click()
            await page.wait_for_timeout(300)

        # 3. Switch to Copy to dates mode
        copy_mode_btn = await page.query_selector("#modeCopyDatesBtn")
        if copy_mode_btn:
            await copy_mode_btn.click()
            await page.wait_for_timeout(300)
            await page.screenshot(path=os.path.abspath("scratch/shift_plan_copy_mode.png"))
            print("Captured shift_plan_copy_mode.png")

        # 4. Open Choose Dates Modal
        choose_btn = await page.query_selector("#bottomMainActionBtn")
        if choose_btn:
            await choose_btn.click()
            await page.wait_for_timeout(400)
            await page.screenshot(path=os.path.abspath("scratch/shift_plan_choose_dates_modal.png"))
            print("Captured shift_plan_choose_dates_modal.png")

        await browser.close()

asyncio.run(run())
