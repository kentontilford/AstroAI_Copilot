# Verified Setup for Astrology AI Copilot

This guide contains only verified working steps for setting up the application.

## What Works Reliably

### Local Development Server

These steps have been verified to work on a standard development machine:

```bash
# Clone the repository
git clone https://github.com/kentontilford/AstroAI_Copilot.git
cd AstroAI_Copilot

# Install dependencies with legacy peer deps flag
npm install --legacy-peer-deps

# Setup local PostgreSQL database
# (You need to have PostgreSQL installed and running)
createdb astrology_app

# Set up your environment variables
cp .env.production.example .env.local
# Edit .env.local and update the values with your real API keys
# Make sure DATABASE_URL points to your local PostgreSQL instance

# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate deploy

# Start the development server
npm run dev
```

Verify it's working by opening http://localhost:3000 in your browser.

## Deployment Options

Since the Docker deployment was problematic, here are alternative approaches:

### 1. Direct Deployment on a VPS/Cloud VM

```bash
# Install Node.js, PostgreSQL, and Git on your server
# Clone your repository
git clone https://github.com/kentontilford/AstroAI_Copilot.git
cd AstroAI_Copilot

# Install PM2 for process management
npm install -g pm2

# Install dependencies
npm install --legacy-peer-deps

# Setup your environment
cp .env.production.example .env.production
# Edit .env.production with production values

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Build the application
npm run build

# Start with PM2 for production
pm2 start npm --name "astrology-app" -- start
pm2 save

# Setup Nginx or Apache as reverse proxy
```

### 2. Vercel Deployment (Alternative to Railway)

Vercel is designed specifically for Next.js apps and often has fewer issues:

1. Create an account at vercel.com
2. Link your GitHub repository
3. Configure environment variables in the Vercel dashboard
4. Deploy with a click

### 3. Simplified Railway Deployment (No Docker)

If you still want to try Railway:

1. In Railway dashboard, create a new project from GitHub repo
2. Important: Turn OFF Docker deployment in settings
3. Set Build Command: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
4. Set Start Command: `npm start`
5. Add PostgreSQL as a service
6. Set environment variables from your .env.production file
7. Deploy

## Validating Your Setup

To verify your setup is working correctly:

1. Check the homepage loads
2. Verify authentication with Clerk works (sign up/sign in)
3. Test any database functions (create profiles, etc.)
4. Verify OpenAI integration works
5. Test Stripe payment functionality (if implemented)

## Need Help?

If you encounter specific errors:

1. Check application logs
2. Verify all API keys are correct
3. Ensure database connection is working
4. Look for any specific error messages in browser console