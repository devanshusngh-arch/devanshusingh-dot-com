from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:4321...")
            page.goto('http://localhost:4321', timeout=10000)
            page.wait_for_load_state('networkidle')
            print("Page title:", page.title())
            page.screenshot(path='homepage_check.png', full_page=True)
            print("Screenshot saved to homepage_check.png")
            
            # Check for "Devanshu Singh"
            content = page.content()
            if "Devanshu Singh" in content:
                print("Found 'Devanshu Singh' in page content.")
            else:
                print("Could NOT find 'Devanshu Singh' in page content.")
                
            # Check for CTAs
            if page.locator('text=View Work').is_visible():
                print("'View Work' button is visible.")
            else:
                print("'View Work' button is NOT visible.")
                
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
