# Railway Deployment Guide

This guide walks through the process of deploying the Astrology AI Copilot application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed locally
   ```
   npm i -g @railway/cli
   ```
3. Git repository for your project (GitHub recommended)

## Initial Setup

### 1. Login to Railway CLI

```bash
railway login
```

### 2. Initialize Project in Railway

```bash
# Create a new project
railway init
```

## Deploy Application

### 1. Provision PostgreSQL Database

```bash
# From your project directory
railway add postgresql
```

### 2. Provision Redis Cache (Optional)

```bash
# From your project directory
railway add redis
```

### 3. Set Environment Variables

Set all required environment variables using the Railway CLI or dashboard:

```bash
# Using CLI for individual variables
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_value
railway variables set CLERK_SECRET_KEY=your_value
# Repeat for all environment variables

# Or bulk import from .env.production file (recommended)
railway variables from .env.production
```

Required variables:
- DATABASE_URL (automatically set by Railway)
- REDIS_URL (automatically set by Railway if Redis is provisioned)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_SIGN_UP_URL
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
- CLERK_WEBHOOK_SECRET
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID
- OPENAI_API_KEY
- OPENAI_ASSISTANT_ID
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- GOOGLE_MAPS_API_KEY_SERVER
- NEXT_PUBLIC_APP_URL (set to your Railway deployment URL or custom domain)

### 4. Deploy to Railway

Deploy directly from your local environment:
```bash
railway up
```

Or connect to your GitHub repository for automatic deployments:
1. Go to Railway dashboard
2. Select your project
3. Click "Connect GitHub repo"
4. Select your repository
5. Set up auto-deploy from the main branch

### 5. Run Database Migrations

```bash
railway run npx prisma migrate deploy
```

### 6. Set Up Domain (Optional)

1. In the Railway dashboard, go to your project settings
2. Click on "Domains"
3. Add a custom domain or use the provided Railway domain
4. Update your NEXT_PUBLIC_APP_URL environment variable with the domain

## Production Setup

### 1. Set Up Webhooks

Update webhook URLs in Clerk and Stripe to point to your production domain:
- Clerk Webhook: `https://your-railway-domain.up.railway.app/api/clerk/webhook`
- Stripe Webhook: `https://your-railway-domain.up.railway.app/api/stripe/webhook`

### 2. Configure Clerk Redirect URLs

Update Clerk redirect URLs to point to your production domain:
- Sign-in URL: `https://your-railway-domain.up.railway.app/log-in`
- Sign-up URL: `https://your-railway-domain.up.railway.app/sign-up`
- After sign-in URL: `https://your-railway-domain.up.railway.app/dashboard/personal`
- After sign-up URL: `https://your-railway-domain.up.railway.app/onboarding/birth-profile`

### 3. Set Up Google Maps API Restrictions

Update Google Maps API key restrictions:
- JavaScript API: Add your Railway domain as allowed referrer
- Geocoding API: Add your Railway server IP to allowed IPs

## Staging Environment (Optional)

Railway supports multiple environments:

```bash
# Create a staging environment
railway environment create staging

# Switch to staging environment
railway environment staging

# Deploy to staging
railway up

# Switch back to production
railway environment production
```

## Monitoring and Maintenance

### 1. View Logs

```bash
railway logs
```

### 2. SSH into Service

```bash
railway ssh
```

### 3. Set Up Database Backups

Railway provides automatic daily backups for databases. To enable:
1. Go to your database service in the Railway dashboard
2. Navigate to the "Backups" tab
3. Configure backup settings

## Updating the Application

1. Push changes to your GitHub repository, or
2. Deploy manually with `railway up`

## Troubleshooting

If the application fails to start:
1. Check the logs with `railway logs`
2. Verify all environment variables are correctly set
3. Ensure database migrations ran successfully
4. Check the health endpoint at `/api/health`

## Cleanup and Removal

To remove the application from Railway:
```bash
railway project delete
```