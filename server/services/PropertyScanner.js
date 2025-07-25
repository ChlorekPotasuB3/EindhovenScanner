const FundaScraper = require('../scrapers/FundaScraper');
const FriendlyHousingScraper = require('../scrapers/FriendlyHousingScraper');

class PropertyScanner {
  constructor(emailService) {
    this.emailService = emailService;
    this.fundaScraper = new FundaScraper();
    this.friendlyHousingScraper = new FriendlyHousingScraper();
    
    // In-memory storage for seen properties (in production, use Redis or database)
    this.seenProperties = new Set();
    this.stats = {
      totalScans: 0,
      totalNotifications: 0,
      lastScanTime: null,
      siteStats: {
        funda: { scans: 0, newProperties: 0, errors: 0 },
        friendlyhousing: { scans: 0, newProperties: 0, errors: 0 }
      }
    };
    this.notificationHistory = [];
  }

  async scanAllSites() {
    console.log('🔍 Starting comprehensive property scan...');
    this.stats.totalScans++;
    this.stats.lastScanTime = new Date();

    const scanPromises = [
      this.scanSite('funda', this.fundaScraper),
      this.scanSite('friendlyhousing', this.friendlyHousingScraper)
    ];

    const results = await Promise.allSettled(scanPromises);
    
    let totalNewProperties = 0;
    results.forEach((result, index) => {
      const sites = ['funda', 'friendlyhousing'];
      const site = sites[index];
      
      if (result.status === 'fulfilled') {
        totalNewProperties += result.value;
        console.log(`✅ ${site}: ${result.value} new properties found`);
      } else {
        console.error(`❌ ${site}: ${result.reason.message}`);
        this.stats.siteStats[site].errors++;
      }
    });

    console.log(`📊 Scan complete: ${totalNewProperties} total new properties found`);
    return totalNewProperties;
  }

  async scanSite(siteName, scraper) {
    try {
      console.log(`🔍 Scanning ${siteName}...`);
      this.stats.siteStats[siteName].scans++;
      
      const properties = await scraper.scrape();
      let newPropertiesCount = 0;

      for (const property of properties) {
        const propertyId = this.generatePropertyId(property);
        
        if (!this.seenProperties.has(propertyId)) {
          this.seenProperties.add(propertyId);
          newPropertiesCount++;
          this.stats.totalNotifications++;
          this.stats.siteStats[siteName].newProperties++;
          
          console.log(`🆕 New property found on ${siteName}: ${property.title}`);
          
          // Send email notification
          try {
            const notificationData = {
              ...property,
              source: siteName.charAt(0).toUpperCase() + siteName.slice(1),
              sentAt: new Date().toISOString()
            };
            await this.emailService.sendPropertyNotification(notificationData);
            // Store notification in history (max 50)
            this.notificationHistory.unshift(notificationData);
            if (this.notificationHistory.length > 50) this.notificationHistory.pop();
          } catch (emailError) {
            console.error(`❌ Failed to send email for ${property.title}:`, emailError.message);
          }
        }
      }

      return newPropertiesCount;
    } catch (error) {
      console.error(`❌ Error scanning ${siteName}:`, error.message);
      
      // Send error notification for critical failures
      if (error.message.includes('login') || error.message.includes('blocked')) {
        await this.emailService.sendErrorNotification(error, siteName);
      }
      
      throw error;
    }
  }

  generatePropertyId(property) {
    // Create a unique ID based on title, price, and location
    const key = `${property.title}-${property.price}-${property.location}`.toLowerCase();
    return Buffer.from(key).toString('base64');
  }

  getStats() {
    return {
      ...this.stats,
      seenPropertiesCount: this.seenProperties.size,
      uptime: process.uptime()
    };
  }

  getLastScanTime() {
    return this.stats.lastScanTime;
  }

  getTotalNotifications() {
    return this.stats.totalNotifications;
  }

  // Method to clear seen properties (useful for testing or maintenance)
  clearSeenProperties() {
    this.seenProperties.clear();
    console.log('🗑️ Cleared seen properties cache');
  }

  // Method to manually add a property to seen list (useful for avoiding duplicates)
  markPropertyAsSeen(property) {
    const propertyId = this.generatePropertyId(property);
    this.seenProperties.add(propertyId);
  }

  // Return the most recent notifications (for dashboard)
  getNotificationHistory() {
    return this.notificationHistory;
  }
}

module.exports = PropertyScanner;
