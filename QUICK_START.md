# Astrology AI Copilot - Quick Start Guide

This guide provides simple steps to get the application running locally.

## Local Development Setup

### Prerequisites
- Node.js v16 or higher
- PostgreSQL database

### Step 1: Clone the repository
```bash
git clone https://github.com/kentontilford/AstroAI_Copilot.git
cd AstroAI_Copilot
```

### Step 2: Set up environment variables
```bash
# Copy example env file
cp .env.production.example .env.local

# Edit .env.local with your API keys and database connection
# Make sure to update these values:
# - Clerk keys
# - Stripe keys
# - OpenAI keys
# - Google Maps keys
# - DATABASE_URL
```

### Step 3: Install dependencies
```bash
npm install --legacy-peer-deps
```

### Step 4: Set up the database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Step 5: Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Troubleshooting

### Missing components error during build
If you encounter errors about missing components during build, try using the development server instead:
```bash
npm run dev
```

### Database connection issues
- Check that your database is running
- Verify the DATABASE_URL in your .env.local file
- Make sure you've run the migrations

### Dependency issues
If you encounter package conflicts, use the legacy peer deps flag:
```bash
npm install --legacy-peer-deps
```

## Production Deployment (Basic)

For a basic production deployment:

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available at http://localhost:3000 by default.

## Next Steps

- Update webhook URLs in Clerk and Stripe
- Test all functionality in your environment
- Consider setting up a reverse proxy (Nginx/Apache) for production use