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
        
        # Click on the first clocking card
        cards = await page.query_selector_all(".history-card-item")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(500)
            
        screenshot_path = os.path.abspath("modal_popout_verification.png")
        await page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")
        await browser.close()

asyncio.run(run())
