# Rental Property Scanner for Eindhoven

Automated rental property scanner that monitors Kamernet.nl, Funda.nl, and FriendlyHousing.nl for new listings in Eindhoven and sends instant email notifications.

## Features

- 🔍 **Multi-site Scanning**: Monitors 3 major rental platforms
- 📧 **Instant Email Alerts**: Get notified immediately when new properties appear
- ⏰ **Automated Scheduling**: Scans every 5 minutes automatically
- 🎯 **Eindhoven Focused**: Specifically targets Eindhoven rental market
- 🔐 **Secure Authentication**: Environment-based credential management

## Technology Stack

- **Backend**: Node.js with Express
- **Web Scraping**: Puppeteer (dynamic sites) + Axios & Cheerio (static sites)
- **Email**: Nodemailer with Gmail
- **Scheduling**: node-cron
- **Frontend**: React (for future dashboard)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start the Scanner**
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NOTIFY_EMAIL` | Email to receive notifications | Yes |
| `SCRAPE_INTERVAL` | Scan interval in minutes (default: 5) | No |

## Monitored Sites

1. **Kamernet.nl** - Requires login, uses Puppeteer
2. **Funda.nl** - Dynamic content, uses Puppeteer
3. **FriendlyHousing.nl** - Static content, uses Axios + Cheerio

## Email Notifications

Each notification includes:
- Property title
- Price
- Location
- Direct link to listing
- Platform source

## Security Notes

- Never commit your `.env` file
- Use Gmail App Passwords instead of regular passwords
- Store credentials securely

## Development

```bash
# Development mode with auto-restart
npm run dev

# Install React client (future feature)
npm run install-client

# Start React client
npm run client
```

## Architecture

```
[ Scheduler (cron) ]
        |
        v
[ Scraper Service ]  ---> Kamernet.nl
        |             ---> Funda.nl  
        |             ---> FriendlyHousing.nl
        v
[ Detect New Listings ]
        |
        v
[ Send Email Notification ]
        |
        v
[ Gmail Inbox ]
```

## Future Enhancements (Phase 2)

- React dashboard for listing management
- Push notifications via Firebase
- Gmail API integration for Pararius confirmation
- Advanced filtering options
- Mobile app support
