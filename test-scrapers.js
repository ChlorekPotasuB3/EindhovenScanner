// Test script to verify scrapers are working
require('dotenv').config();

const FundaScraper = require('./server/scrapers/FundaScraper');
const FriendlyHousingScraper = require('./server/scrapers/FriendlyHousingScraper');
const KamernetScraper = require('./server/scrapers/KamernetScraper');

async function testScrapers() {
  console.log('🧪 Testing rental property scrapers...\n');

  // Test FriendlyHousing (static scraping)
  console.log('1️⃣ Testing FriendlyHousing scraper...');
  try {
    const friendlyHousingScraper = new FriendlyHousingScraper();
    const friendlyProperties = await friendlyHousingScraper.scrape();
    console.log(`✅ FriendlyHousing: Found ${friendlyProperties.length} properties`);
    if (friendlyProperties.length > 0) {
      console.log('Sample property:', friendlyProperties[0]);
    }
  } catch (error) {
    console.error('❌ FriendlyHousing test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Funda (dynamic scraping)
  console.log('2️⃣ Testing Funda scraper...');
  try {
    const fundaScraper = new FundaScraper();
    const fundaProperties = await fundaScraper.scrape();
    console.log(`✅ Funda: Found ${fundaProperties.length} properties`);
    if (fundaProperties.length > 0) {
      console.log('Sample property:', fundaProperties[0]);
    }
    await fundaScraper.close();
  } catch (error) {
    console.error('❌ Funda test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Kamernet (requires login)
  console.log('3️⃣ Testing Kamernet scraper...');
  if (!process.env.KAMERNET_EMAIL || !process.env.KAMERNET_PASSWORD) {
    console.log('⚠️ Kamernet credentials not found in .env file. Skipping Kamernet test.');
    console.log('Please add KAMERNET_EMAIL and KAMERNET_PASSWORD to your .env file to test Kamernet.');
  } else {
    try {
      const kamernetScraper = new KamernetScraper();
      const kamernetProperties = await kamernetScraper.scrape();
      console.log(`✅ Kamernet: Found ${kamernetProperties.length} properties`);
      if (kamernetProperties.length > 0) {
        console.log('Sample property:', kamernetProperties[0]);
      }
      await kamernetScraper.close();
    } catch (error) {
      console.error('❌ Kamernet test failed:', error.message);
    }
  }

  console.log('\n🏁 Scraper testing completed!');
  process.exit(0);
}

// Run the test
testScrapers().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
