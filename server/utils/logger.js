const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, message) {
    const logFile = path.join(this.logDir, filename);
    fs.appendFileSync(logFile, message + '\n');
  }

  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(`ℹ️ ${message}`);
    this.writeToFile('app.log', logMessage);
  }

  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : null;
    
    const logMessage = this.formatMessage('ERROR', message, errorData);
    console.error(`❌ ${message}`);
    this.writeToFile('error.log', logMessage);
  }

  success(message, data = null) {
    const logMessage = this.formatMessage('SUCCESS', message, data);
    console.log(`✅ ${message}`);
    this.writeToFile('app.log', logMessage);
  }

  warning(message, data = null) {
    const logMessage = this.formatMessage('WARNING', message, data);
    console.warn(`⚠️ ${message}`);
    this.writeToFile('app.log', logMessage);
  }

  scan(site, count, newCount) {
    const message = `Scan completed for ${site}: ${count} total, ${newCount} new`;
    const data = { site, totalCount: count, newCount };
    
    const logMessage = this.formatMessage('SCAN', message, data);
    console.log(`🔍 ${message}`);
    this.writeToFile('scans.log', logMessage);
  }

  notification(property, site) {
    const message = `Email sent for new property: ${property.title}`;
    const data = { 
      site, 
      property: {
        title: property.title,
        price: property.price,
        location: property.location,
        link: property.link
      }
    };
    
    const logMessage = this.formatMessage('NOTIFICATION', message, data);
    console.log(`📧 ${message}`);
    this.writeToFile('notifications.log', logMessage);
  }

  // Clean old log files (keep last 7 days)
  cleanOldLogs() {
    const logFiles = ['app.log', 'error.log', 'scans.log', 'notifications.log'];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    logFiles.forEach(filename => {
      const logFile = path.join(this.logDir, filename);
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.mtime < sevenDaysAgo) {
          fs.unlinkSync(logFile);
          console.log(`🗑️ Cleaned old log file: ${filename}`);
        }
      }
    });
  }
}

module.exports = new Logger();
