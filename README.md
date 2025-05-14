# Astrology AI Copilot

An AI-powered astrological guide that seamlessly integrates ancient wisdom with modern technology to help people navigate their lives with greater clarity, purpose, and confidence.

## Features

- **Personal Growth Dashboard**: Get personalized astrological insights for your personal growth journey
- **Relationships Dashboard**: Explore relationship dynamics through composite charts
- **Birth Profile Vault**: Store and manage multiple birth profiles
- **AI Copilot Chat**: Engage with an intelligent AI assistant trained in astrology
- **Subscription Management**: Access premium features through a subscription model

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: OpenAI Assistants API
- **Astrology Calculations**: Swiss Ephemeris (WASM)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Clerk account
- Stripe account
- OpenAI API key
- Google Maps API key

### Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables in the `.env.local` file:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/log-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
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

3. Validate your environment variables:

```bash
npm run validate-env
```

This will check that all required environment variables are properly configured before running the application.

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/astrology-ai-copilot.git
   cd astrology-ai-copilot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development

### Database Management

- Generate Prisma client after schema changes:
  ```
  npx prisma generate
  ```

- Create and apply migrations:
  ```
  npx prisma migrate dev --name your_migration_name
  ```

- View your database:
  ```
  npx prisma studio
  ```

### Third-Party Services Setup

#### Clerk
1. Create a Clerk application at [clerk.com](https://clerk.com/)
2. Configure the authentication settings
3. Set up a webhook endpoint (`/api/clerk/webhook`) with the `user.created` event

#### Stripe
1. Create a Stripe account at [stripe.com](https://stripe.com/)
2. Set up a subscription product and price
3. Configure the webhook endpoint (`/api/stripe/webhook`) with the necessary events

#### OpenAI
1. Create an OpenAI account and get an API key
2. Create an Assistant using the Assistants API with appropriate system prompts for astrological guidance

## Deployment

### Deployment Options

The application can be deployed using several methods:

#### 1. Railway (Recommended)

We provide scripts to easily deploy to Railway:

```bash
# Deploy to Railway
npm run deploy:railway

# Monitor Railway deployment
npm run railway:monitor

# Run database migrations on Railway
npm run railway:migrate
```

For detailed Railway deployment information, see:
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Detailed deployment steps
- [RAILWAY_CHECKLIST.md](RAILWAY_CHECKLIST.md) - Pre and post-deployment checklist

#### 2. Docker Deployment

We provide Docker and Docker Compose configurations for containerized deployment:

```bash
# Build Docker image
npm run docker-build

# Start with Docker Compose (development)
npm run docker-start

# For production
docker-compose -f docker-compose.production.yml up -d
```

#### 3. Traditional Deployment

1. Set up your production environment variables as per your hosting provider's guidelines
2. Make sure to validate your environment variables before deployment:

```bash
npm run validate-env
```

3. Build the application:

```bash
npm run build
```

4. Start the production server:

```bash
npm run start
```

### Comprehensive Deployment Documentation

For more detailed deployment information, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Deployment options summary

### Production Considerations

- Ensure all webhooks are properly configured for your production domain
- Set up proper monitoring and error tracking
- Consider using a reverse proxy (like Nginx) for improved performance
- Configure database backups and failover solutions
- Set up SSL for secure connections

## License

[MIT](LICENSE)