const puppeteer = require('puppeteer');
const fs = require('fs');

const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

console.log('PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  console.log('Checking Chrome binary exists at:', process.env.PUPPETEER_EXECUTABLE_PATH);
  try {
    if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
      console.log('Chrome binary exists and is accessible.');
    } else {
      console.error('Chrome binary does NOT exist at the given path!');
    }
  } catch (err) {
    console.error('Error checking Chrome binary:', err);
  }
}

class FundaScraper {
  constructor() {
    this.baseUrl = 'https://www.funda.nl';
    this.searchUrl = 'https://www.funda.nl/huur/eindhoven/';
    this.browser = null;
    this.page = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    if (!this.page) {
      this.page = await this.browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await this.page.setViewport({ width: 1366, height: 768 });
    }
  }

  async scrape() {
    try {
      await this.initBrowser();

      console.log('🔍 Scraping Funda listings...');
      
      // Navigate to Eindhoven rental search
      await this.page.goto(this.searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Handle cookie consent if present
      try {
        await this.page.waitForSelector('#consent-accept', { timeout: 5000 });
        await this.page.click('#consent-accept');
        console.log('✅ Accepted Funda cookies');
      } catch (error) {
        // Cookie banner might not be present
        console.log('ℹ️ No cookie banner found on Funda');
      }

      // Wait for search results to load
      await this.page.waitForSelector('[data-test-id="search-result-item"]', { timeout: 15000 });

      // Extract property listings
      const properties = await this.page.evaluate(() => {
        const listings = document.querySelectorAll('[data-test-id="search-result-item"]');
        const results = [];

        listings.forEach(listing => {
          try {
            const titleElement = listing.querySelector('[data-test-id="street-name-house-number"]');
            const priceElement = listing.querySelector('[data-test-id="price-rent"]');
            const locationElement = listing.querySelector('[data-test-id="city"]');
            const linkElement = listing.querySelector('a[data-test-id="object-image-link"]');
            const descriptionElement = listing.querySelector('[data-test-id="object-description"]');

            if (titleElement && priceElement && locationElement && linkElement) {
              const title = titleElement.textContent.trim();
              const price = priceElement.textContent.trim();
              const location = locationElement.textContent.trim();
              const link = linkElement.href;
              const description = descriptionElement ? descriptionElement.textContent.trim() : title;

              // Ensure it's in Eindhoven
              if (location.toLowerCase().includes('eindhoven')) {
                results.push({
                  title,
                  price,
                  location,
                  link,
                  description
                });
              }
            }
          } catch (error) {
            console.error('Error parsing Funda listing:', error);
          }
        });

        return results;
      });

      console.log(`📊 Found ${properties.length} properties on Funda`);
      return properties;

    } catch (error) {
      console.error('❌ Funda scraping failed:', error.message);
      
      // Take screenshot for debugging if needed
      if (this.page) {
        try {
          await this.page.screenshot({ path: 'funda-error.png', fullPage: true });
          console.log('📸 Screenshot saved as funda-error.png');
        } catch (screenshotError) {
          console.error('Failed to take screenshot:', screenshotError.message);
        }
      }
      
      throw new Error(`Funda scraping failed: ${error.message}`);
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Cleanup method for graceful shutdown
  async cleanup() {
    await this.close();
  }
}

module.exports = FundaScraper;
