# Manual Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Astrology AI Copilot to Railway.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- Railway CLI installed (`npm install -g @railway/cli`)
- Your `.env.production` file configured with all necessary credentials

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Create a New Project

```bash
# Create a new project
railway init
```

Follow the prompts to create a new project named "astrology-ai-copilot".

### 3. Set Up Production Environment

```bash
# Create production environment
railway environment create production

# Switch to production environment
railway environment production
```

### 4. Add PostgreSQL Database

```bash
# Add PostgreSQL
railway add postgresql
```

### 5. Set Environment Variables

```bash
# Set environment variables from .env.production
# Use the actual values from your .env.production file, NOT the examples below

# Clerk Authentication
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
railway variables set CLERK_SECRET_KEY=your_clerk_secret_key
railway variables set NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
railway variables set NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
railway variables set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/personal
railway variables set NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/birth-profile
railway variables set CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe
railway variables set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
railway variables set STRIPE_SECRET_KEY=your_stripe_secret_key
railway variables set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
railway variables set STRIPE_PRICE_ID=your_stripe_price_id

# OpenAI
railway variables set OPENAI_API_KEY=your_openai_api_key
railway variables set OPENAI_ASSISTANT_ID=your_openai_assistant_id

# Google Maps
railway variables set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
railway variables set GOOGLE_MAPS_API_KEY_SERVER=your_google_maps_api_key_server

# App Settings
railway variables set NEXT_PUBLIC_APP_URL=https://astrology-ai-copilot.up.railway.app
railway variables set NODE_ENV=production
railway variables set ANALYZE=false
```

### 6. Deploy the Application

```bash
# Deploy the application
railway up
```

### 7. Run Database Migrations

```bash
# Run migrations
railway run npx prisma migrate deploy
```

### 8. Access Your Application

After deployment completes, you can access your application at the URL provided by Railway. It should be something like:

```
https://astrology-ai-copilot-production.up.railway.app
```

You can also find the URL by running:

```bash
railway service
```

### 9. Post-Deployment Configuration

1. **Update Webhook URLs**: Update your Clerk and Stripe webhook endpoints to point to your production domain.

   - Clerk webhook: `https://your-app-url.up.railway.app/api/clerk/webhook`
   - Stripe webhook: `https://your-app-url.up.railway.app/api/stripe/webhook`

2. **Verify Database Connection**: Check that your application is connecting to the database correctly.

3. **Monitor Logs**: Monitor the application logs for any issues.

   ```bash
   railway logs
   ```

## Troubleshooting

If you encounter any issues during deployment:

1. **Check Logs**: Use `railway logs` to check for errors.

2. **Environment Variables**: Verify all environment variables are set correctly.

3. **Database Issues**: If database migrations fail, try:
   ```bash
   railway service
   ```
   to ensure the database service is properly provisioned.

4. **Restart Service**: If needed, restart the service:
   ```bash
   railway service restart
   ```

5. **Delete and Redeploy**: If all else fails, you can delete the service and redeploy:
   ```bash
   railway service delete
   railway up
   ```