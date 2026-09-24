import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 420, "height": 900})
        
        # Test 1: Open modules/claims/index.html
        index_path = 'file:///' + os.path.abspath('modules/claims/index.html').replace('\\', '/')
        await page.goto(index_path)
        await page.wait_for_timeout(500)
        
        # Check if Travel Request is rendered
        content = await page.content()
        print("Index has Travel Request:", "Travel Request" in content)
        
        # Screenshot index
        await page.screenshot(path='scratch/index_claims.png')
        
        # Test 2: Open modules/claims/options/travel-request.html
        tr_path = 'file:///' + os.path.abspath('modules/claims/options/travel-request.html').replace('\\', '/')
        await page.goto(tr_path)
        await page.wait_for_timeout(500)
        
        print("Travel Request Title:", await page.title())
        await page.screenshot(path='scratch/tr_tab_general.png')
        
        # Click Task tab
        await page.click('#tab-btn-task')
        await page.wait_for_timeout(300)
        await page.screenshot(path='scratch/tr_tab_task.png')
        
        # Click Traveling tab
        await page.click('#tab-btn-traveling')
        await page.wait_for_timeout(300)
        await page.screenshot(path='scratch/tr_tab_traveling.png')
        
        # Click Accomodation tab
        await page.click('#tab-btn-accomodation')
        await page.wait_for_timeout(300)
        await page.screenshot(path='scratch/tr_tab_accomodation.png')
        
        await browser.close()

asyncio.run(run())
