import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 430, "height": 932})
        
        filepath = os.path.abspath("modules/attendance/options/clocking-history.html")
        await page.goto(f"file:///{filepath}")
        await page.wait_for_load_state("networkidle")
        
        # Click OT Plan Tab
        await page.click("#tabOt")
        await page.wait_for_timeout(300)
        
        # Click the second OT card (OTB000000001604)
        ot_cards = await page.query_selector_all("#viewOtHistory .history-card-item")
        if len(ot_cards) >= 2:
            await ot_cards[1].click()
            await page.wait_for_timeout(500)
            
        screenshot_path = os.path.abspath("ot_modal_popout_verification.png")
        await page.screenshot(path=screenshot_path)
        print(f"OT Modal Screenshot saved to {screenshot_path}")
        await browser.close()

asyncio.run(run())
