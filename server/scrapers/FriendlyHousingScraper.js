const axios = require('axios');
const cheerio = require('cheerio');

class FriendlyHousingScraper {
  constructor() {
    this.baseUrl = 'https://friendlyhousing.nl';
    this.searchUrl = 'https://friendlyhousing.nl/rooms-eindhoven';
    this.axiosConfig = {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };
  }

  async scrape() {
    try {
      console.log('🔍 Scraping FriendlyHousing listings...');
      
      // Fetch the search page
      const response = await axios.get(this.searchUrl, this.axiosConfig);
      const $ = cheerio.load(response.data);

      const properties = [];

      // Look for property listings - adjust selectors based on actual HTML structure
      $('.property-item, .listing-item, .room-item, .property-card').each((index, element) => {
        try {
          const $element = $(element);
          
          // Try different possible selectors for title
          const title = $element.find('.property-title, .listing-title, .room-title, h3, h2').first().text().trim() ||
                       $element.find('a').first().text().trim();
          
          // Try different possible selectors for price
          const price = $element.find('.price, .rent, .cost, .amount').first().text().trim() ||
                       $element.find('*').filter(function() {
                         return $(this).text().match(/€\s*\d+/);
                       }).first().text().trim();
          
          // Try different possible selectors for location
          const location = $element.find('.location, .address, .city').first().text().trim() ||
                          'Eindhoven'; // Default to Eindhoven since we're searching there
          
          // Try different possible selectors for link
          const linkElement = $element.find('a').first();
          let link = linkElement.attr('href');
          if (link && !link.startsWith('http')) {
            link = this.baseUrl + (link.startsWith('/') ? link : '/' + link);
          }
          
          // Try to get description
          const description = $element.find('.description, .summary, .excerpt').first().text().trim() ||
                             title; // Use title as fallback

          if (title && price && link) {
            // Filter for Eindhoven properties
            if (location.toLowerCase().includes('eindhoven') || 
                title.toLowerCase().includes('eindhoven') ||
                description.toLowerCase().includes('eindhoven')) {
              
              properties.push({
                title: title.substring(0, 200), // Limit title length
                price: price.substring(0, 50), // Limit price length
                location: location || 'Eindhoven',
                link: link,
                description: description.substring(0, 300) // Limit description length
              });
            }
          }
        } catch (error) {
          console.error('Error parsing FriendlyHousing listing:', error.message);
        }
      });

      // If no properties found with specific selectors, try a more generic approach
      if (properties.length === 0) {
        console.log('🔄 Trying alternative scraping approach for FriendlyHousing...');
        
        // Look for any links that might be property listings
        $('a').each((index, element) => {
          try {
            const $element = $(element);
            const href = $element.attr('href');
            const text = $element.text().trim();
            
            // Check if this looks like a property listing
            if (href && text && 
                (href.includes('room') || href.includes('property') || href.includes('listing')) &&
                (text.includes('€') || text.length > 10)) {
              
              let link = href;
              if (!link.startsWith('http')) {
                link = this.baseUrl + (link.startsWith('/') ? link : '/' + link);
              }
              
              // Try to extract price from surrounding elements
              const parent = $element.parent();
              const priceText = parent.find('*').filter(function() {
                return $(this).text().match(/€\s*\d+/);
              }).first().text().trim() || 'Price on request';
              
              properties.push({
                title: text.substring(0, 200),
                price: priceText.substring(0, 50),
                location: 'Eindhoven',
                link: link,
                description: text.substring(0, 300)
              });
            }
          } catch (error) {
            // Ignore individual parsing errors
          }
        });
      }

      // Remove duplicates based on link
      const uniqueProperties = properties.filter((property, index, self) => 
        index === self.findIndex(p => p.link === property.link)
      );

      console.log(`📊 Found ${uniqueProperties.length} properties on FriendlyHousing`);
      return uniqueProperties;

    } catch (error) {
      console.error('❌ FriendlyHousing scraping failed:', error.message);
      
      // If it's a network error, provide more context
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error(`FriendlyHousing network error: ${error.message}. Site might be down or blocking requests.`);
      }
      
      throw new Error(`FriendlyHousing scraping failed: ${error.message}`);
    }
  }

  // Method to test if the site is accessible
  async testConnection() {
    try {
      const response = await axios.get(this.baseUrl, {
        ...this.axiosConfig,
        timeout: 10000
      });
      return response.status === 200;
    } catch (error) {
      console.error('FriendlyHousing connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = FriendlyHousingScraper;
