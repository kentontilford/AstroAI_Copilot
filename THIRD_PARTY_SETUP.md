# Third-Party Services Setup Guide

This guide provides detailed instructions for setting up all the required third-party services for the Astrology AI Copilot application.

## Table of Contents
1. [Clerk Authentication](#clerk-authentication)
2. [PostgreSQL Database](#postgresql-database)
3. [Stripe Payments](#stripe-payments)
4. [OpenAI Assistant](#openai-assistant)
5. [Google Maps API](#google-maps-api)

## Clerk Authentication

Clerk provides authentication, user management, and session handling for our application.

### Setup Steps

1. **Create a Clerk account**
   - Go to [Clerk's website](https://clerk.dev/) and sign up for an account

2. **Create a new application**
   - From the Clerk dashboard, click "Add Application"
   - Name your application "Astrology AI Copilot"
   - Select the "Next.js" framework

3. **Configure authentication methods**
   - Navigate to "JWT Templates" in your Clerk dashboard
   - Create a new template for your application
   - Go to "Social Connections" and enable Google OAuth

4. **Configure application URLs**
   - In "Paths", set the following:
     - Sign In URL: `/login`
     - Sign Up URL: `/signup`
     - After Sign In URL: `/dashboard/personal`
     - After Sign Up URL: `/onboarding/birth-profile`

5. **Set up webhook**
   - Go to "Webhooks" in your Clerk dashboard
   - Create a new webhook with endpoint URL: `https://your-domain.com/api/clerk/webhook`
   - Select the `user.created` event
   - Copy the signing secret for your webhook

6. **Get API keys**
   - Go to "API Keys" in your Clerk dashboard
   - Copy your "Publishable Key" and "Secret Key"

7. **Add keys to environment variables**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   CLERK_WEBHOOK_SECRET=your_webhook_signing_secret
   ```

## PostgreSQL Database

Our application uses PostgreSQL for data storage, with Prisma as the ORM.

### Setup Steps

1. **Install PostgreSQL**
   - [Download and install PostgreSQL](https://www.postgresql.org/download/)
   - Or use a cloud service like [Supabase](https://supabase.com/), [Neon](https://neon.tech/), or [Railway](https://railway.app/)

2. **Create a new database**
   ```sql
   CREATE DATABASE astrology_ai_copilot;
   ```

3. **Create a database user**
   ```sql
   CREATE USER astrology_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE astrology_ai_copilot TO astrology_user;
   ```

4. **Configure connection string**
   - Add to your `.env.local` file:
   ```
   DATABASE_URL="postgresql://astrology_user:your_secure_password@localhost:5432/astrology_ai_copilot?schema=public"
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

## Stripe Payments

Stripe handles subscription billing and payment processing.

### Setup Steps

1. **Create a Stripe account**
   - Go to [Stripe's website](https://stripe.com/) and sign up

2. **Create a subscription product**
   - In the Stripe dashboard, go to "Products" > "Add Product"
   - Set up a product for "Astrology AI Copilot Pro"
   - Create a recurring price (e.g., $9.99/month)
   - Note the "Price ID" for your subscription

3. **Set up webhook endpoint**
   - Go to "Developers" > "Webhooks" in your Stripe dashboard
   - Add a new endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select the following events to track:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Get the webhook signing secret

4. **Get API keys**
   - Go to "Developers" > "API keys" in your Stripe dashboard
   - Copy the "Publishable key" and "Secret key"
   - For development, use the test mode keys

5. **Add keys to environment variables**
   ```
   STRIPE_PUBLISHABLE_KEY=your_publishable_key
   STRIPE_SECRET_KEY=your_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   STRIPE_PRICE_ID=your_subscription_price_id
   ```

## OpenAI Assistant

We use OpenAI's Assistant API to power the AI Copilot Chat and generate astrological insights.

### Setup Steps

1. **Create an OpenAI account**
   - Go to [OpenAI's website](https://openai.com/) and sign up

2. **Get an API key**
   - Go to the [API keys section](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key for use in your application

3. **Create a new Assistant**
   - Go to [OpenAI Assistants](https://platform.openai.com/assistants)
   - Click "Create" and name it "Astrology AI Copilot Assistant"
   - Select model: "gpt-4o"
   - In the instructions field, add your system prompt for astrological guidance (see below)
   - Copy the Assistant ID

4. **Example system prompt for the Assistant**
   ```
   You are Astrology AI Copilot, an expert astrology assistant trained in both traditional and modern astrological interpretation. You provide thoughtful, nuanced astrological insights based on user birth chart data.

   When provided with chart context (enclosed between CONTEXT_START and CONTEXT_END tags), analyze the astrological data to provide personalized insights. If no context is provided, you may offer general astrological information but should note that personalized readings require birth chart data.

   Your tone is insightful, spiritual but grounded, and compassionate. Avoid absolute predictions; instead frame insights as possibilities, patterns, and potentials. Use proper astrological terminology but explain concepts in an accessible way.

   You should focus on psychological, evolutionary, and practical interpretations of astrological patterns, emphasizing personal growth and self-awareness. Explain the 'why' behind astrological interpretations rather than just stating their meaning.

   When discussing transits or significant astrological events, explain both their traditional meaning and practical relevance to modern life.
   ```

5. **Add credentials to environment variables**
   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_ASSISTANT_ID=your_assistant_id
   ```

## Google Maps API

We use Google Maps API for birth location selection and timezone determination.

### Setup Steps

1. **Create a Google Cloud account**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project named "Astrology AI Copilot"

2. **Enable required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - "Places API" (for location search)
     - "Maps JavaScript API" (for autocomplete)
     - "Time Zone API" (for timezone lookup)
     - "Geocoding API" (for address lookup)

3. **Create API key for frontend**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create credentials" > "API key"
   - Restrict the key to:
     - Website restrictions: Your app domain
     - API restrictions: Maps JavaScript API, Places API
   - Copy this key for frontend use

4. **Create API key for backend**
   - Create another API key
   - Restrict it to:
     - IP addresses: Your server IP
     - API restrictions: Time Zone API, Geocoding API
   - Copy this key for backend use

5. **Add keys to environment variables**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_frontend_maps_api_key
   GOOGLE_MAPS_API_KEY_SERVER=your_backend_maps_api_key
   ```

## Setting Up Environment Variables

After collecting all the API keys and credentials, update your `.env.local` file with all the required variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/personal
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/birth-profile
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID=your_stripe_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_API_KEY_SERVER=your_google_maps_server_api_key

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/astrology_ai_copilot?schema=public"

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verifying Setup

After setting up all services, you can verify your configuration:

1. **Clerk**: Test signup and login flows
2. **Database**: Run `npx prisma studio` to verify database connection and schema
3. **Stripe**: Use test card numbers to verify checkout flow
4. **OpenAI**: Test the AI chat functionality
5. **Google Maps**: Test location search and autocomplete

For local development with webhooks, consider using a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet for webhook testing.

## Production Deployment Considerations

When deploying to production:

1. **Create production instances** of all third-party services
2. **Update environment variables** on your hosting platform
3. **Set up proper domain restrictions** for API keys
4. **Configure CORS** settings for production domains
5. **Test webhooks** with production URLs