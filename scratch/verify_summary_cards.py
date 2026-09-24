import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        
        file_path = os.path.abspath("modules/attendance/options/shift-plan.html")
        await page.goto(f"file:///{file_path}")
        await page.wait_for_timeout(500)
        
        # Click on Work Shift Summary stat card on calendar page
        await page.evaluate("switchView('view-work-shift-summary')")
        await page.wait_for_timeout(300)
        
        # Take screenshot of Work Shift Summary view
        os.makedirs("scratch", exist_ok=True)
        await page.screenshot(path="scratch/work_shift_summary_cards.png")
        print("Work shift summary screenshot saved successfully.")
        
        await browser.close()

asyncio.run(run())
