const puppeteer = require('puppeteer');

class KamernetScraper {
  constructor() {
    this.baseUrl = 'https://kamernet.nl';
    this.searchUrl = 'https://kamernet.nl/huren/kamer-eindhoven';
    this.browser = null;
    this.page = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
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

  async login() {
    try {
      console.log('🔐 Logging into Kamernet...');
      
      await this.page.goto('https://kamernet.nl/en/users/sign_in', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for login form
      await this.page.waitForSelector('input[name="user[email]"]', { timeout: 10000 });
      
      // Fill login form
      await this.page.type('input[name="user[email]"]', process.env.KAMERNET_EMAIL);
      await this.page.type('input[name="user[password]"]', process.env.KAMERNET_PASSWORD);
      
      // Submit form
      await Promise.all([
        this.page.click('input[type="submit"]'),
        this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
      ]);

      // Check if login was successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('sign_in')) {
        throw new Error('Login failed - check credentials');
      }

      console.log('✅ Successfully logged into Kamernet');
      return true;
    } catch (error) {
      console.error('❌ Kamernet login failed:', error.message);
      throw new Error(`Kamernet login failed: ${error.message}`);
    }
  }

  async scrape() {
    try {
      await this.initBrowser();
      await this.login();

      console.log('🔍 Scraping Kamernet listings...');
      
      // Navigate to Eindhoven search results
      await this.page.goto(this.searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for listings to load
      await this.page.waitForSelector('.tile-container', { timeout: 15000 });

      // Extract property listings
      const properties = await this.page.evaluate(() => {
        const listings = document.querySelectorAll('.tile-container .tile');
        const results = [];

        listings.forEach(listing => {
          try {
            const titleElement = listing.querySelector('.tile-title a');
            const priceElement = listing.querySelector('.tile-price');
            const locationElement = listing.querySelector('.tile-location');
            const linkElement = listing.querySelector('.tile-title a');

            if (titleElement && priceElement && locationElement && linkElement) {
              const title = titleElement.textContent.trim();
              const price = priceElement.textContent.trim();
              const location = locationElement.textContent.trim();
              const link = linkElement.href;

              // Only include Eindhoven properties
              if (location.toLowerCase().includes('eindhoven')) {
                results.push({
                  title,
                  price,
                  location,
                  link,
                  description: title // Use title as description for Kamernet
                });
              }
            }
          } catch (error) {
            console.error('Error parsing listing:', error);
          }
        });

        return results;
      });

      console.log(`📊 Found ${properties.length} properties on Kamernet`);
      return properties;

    } catch (error) {
      console.error('❌ Kamernet scraping failed:', error.message);
      throw new Error(`Kamernet scraping failed: ${error.message}`);
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

module.exports = KamernetScraper;
