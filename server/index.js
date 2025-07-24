const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const PropertyScanner = require('./services/PropertyScanner');
const EmailService = require('./services/EmailService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const emailService = new EmailService();
const propertyScanner = new PropertyScanner(emailService);

// Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Rental Property Scanner is active',
    lastScan: propertyScanner.getLastScanTime(),
    totalNotifications: propertyScanner.getTotalNotifications()
  });
});

app.get('/api/stats', (req, res) => {
  res.json(propertyScanner.getStats());
});

// NEW: Get notification history
app.get('/api/notifications', (req, res) => {
  res.json(propertyScanner.getNotificationHistory());
});

app.post('/api/test-email', async (req, res) => {
  try {
    await emailService.sendTestEmail();
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule scanning every 5 minutes (or as configured)
const scanInterval = process.env.SCRAPE_INTERVAL || 5;
console.log(`🕐 Scheduling scans every ${scanInterval} minutes`);

cron.schedule(`*/${scanInterval} * * * *`, async () => {
  console.log('🔍 Starting scheduled property scan...');
  try {
    await propertyScanner.scanAllSites();
  } catch (error) {
    console.error('❌ Scheduled scan failed:', error.message);
  }
});

// Initial scan on startup
setTimeout(async () => {
  console.log('🚀 Running initial property scan...');
  try {
    await propertyScanner.scanAllSites();
  } catch (error) {
    console.error('❌ Initial scan failed:', error.message);
  }
}, 5000); // Wait 5 seconds after startup

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📧 Email notifications will be sent to: ${process.env.NOTIFY_EMAIL}`);
  console.log(`🎯 Monitoring rental properties in Eindhoven...`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
