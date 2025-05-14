# Deployment Guide

This document outlines the deployment process and configuration for the Astrology AI Copilot application.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Configuration](#environment-configuration)
3. [Database Preparation](#database-preparation)
4. [Containerized Deployment](#containerized-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Logging](#monitoring-and-logging)
7. [Backup & Recovery](#backup-and-recovery)
8. [Security Considerations](#security-considerations)

## Deployment Options

The application can be deployed using several methods:

### 1. Managed Next.js Platforms (Recommended)

- **Vercel**: Optimized for Next.js applications.
  - Easy zero-configuration deployment
  - Built-in CI/CD, preview deployments
  - Edge functions and global CDN
  - [Deploy to Vercel](https://vercel.com/new)

- **Netlify**: Full-featured alternative with similar capabilities.
  - Continuous deployment from Git
  - Serverless functions support
  - [Deploy to Netlify](https://app.netlify.com/start)

### 2. Container Orchestration Platforms

- **Railway**: Simple container deployment with built-in PostgreSQL.
  - Easy environment configuration
  - Database management included
  - [Deploy to Railway](https://railway.app/)

- **Render**: Container and database hosting with easy scaling.
  - Auto-deploys from GitHub
  - Managed PostgreSQL service
  - [Deploy to Render](https://render.com/)

### 3. Self-Hosted Options

- **Docker Container**: Deploy using the included Dockerfile.
- **Kubernetes**: For more complex infrastructure requirements.

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file based on the `.env.production.example` template.

```bash
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
DATABASE_URL=postgresql://username:password@host:port/database

# App Settings
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Environment Variable Sources

For managed platforms (Vercel, Netlify, Railway):
- Add environment variables through the platform's dashboard UI
- Use platform-specific methods for handling secrets

For containerized deployments:
- Use container orchestration platform's secret management
- Or mount a volume containing the `.env.production` file

## Database Preparation

### 1. Database Setup

Create a production PostgreSQL database:
```sql
CREATE DATABASE astrology_ai_copilot_production;
CREATE USER astrology_app WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE astrology_ai_copilot_production TO astrology_app;
```

### 2. Connection String

Construct your database connection string:
```
DATABASE_URL=postgresql://astrology_app:your_secure_password@db_host:5432/astrology_ai_copilot_production
```

### 3. Database Migrations

Run migrations before starting the application:
```bash
npx prisma migrate deploy
```

In containerized environments, migrations run automatically on startup.

## Containerized Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t astrology-ai-copilot:latest .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env.production astrology-ai-copilot:latest
```

### Using Docker Compose

1. Set up your environment variables in `.env.production`

2. Start the services:
```bash
docker-compose up -d
```

### Container Registry

We use GitHub Container Registry (GHCR) to store Docker images:
```bash
# Tag the image
docker tag astrology-ai-copilot:latest ghcr.io/yourusername/astrology-ai-copilot:latest

# Push to registry
docker push ghcr.io/yourusername/astrology-ai-copilot:latest
```

## CI/CD Pipeline

Our CI/CD pipeline is implemented with GitHub Actions:

1. **Linting & Testing**: On every PR and push to main
2. **Build**: Builds the Next.js application after tests pass
3. **Docker Build**: Creates and pushes a Docker image to GHCR
4. **Staging Deployment**: Automatic deployment to the staging environment
5. **Production Deployment**: Manual approval required before deployment

### Pipeline Configuration

The pipeline is defined in `.github/workflows/ci-cd.yml`. Required secrets:
- `RAILWAY_TOKEN`: For Railway deployments
- GitHub secrets for container registry access

## Monitoring and Logging

### Health Checks

The application provides a health check endpoint at `/api/health` that returns:
- Application status
- Database connectivity
- Version information

### Recommended Monitoring Tools

1. **Application Monitoring**:
   - [Sentry](https://sentry.io): Error tracking and performance monitoring
   - [LogRocket](https://logrocket.com): Session replay and monitoring

2. **Infrastructure Monitoring**:
   - [Datadog](https://datadoghq.com): Comprehensive monitoring
   - [New Relic](https://newrelic.com): Performance monitoring
   - [Prometheus + Grafana](https://prometheus.io): Open-source monitoring stack

### Logging

Configure structured logging in production:
- Use JSON log format
- Include request IDs for traceability
- Include timestamps and log levels

## Backup and Recovery

### Database Backups

1. **Automated Backups**:
   - Most managed PostgreSQL providers include automated backups
   - For self-hosted: Set up pg_dump cron jobs

2. **Backup Schedule**:
   - Daily full database backups
   - Transaction log backups every hour
   - Retain backups for at least 30 days

3. **Recovery Testing**:
   - Regularly test database restoration process
   - Document recovery procedures

### Application State

1. **Configuration Backups**:
   - Store environment configurations securely
   - Version-control infrastructure as code

2. **Disaster Recovery Plan**:
   - Document complete recovery procedures
   - Include responsibility assignments

## Security Considerations

### 1. HTTPS Configuration

- Always use HTTPS in production
- Configure SSL certificates (Let's Encrypt recommended)
- Set up proper HSTS headers

### 2. API Security

- Rate limiting on all API routes
- Validate all input data
- Implement proper CORS configuration

### 3. Database Security

- Use strong, unique passwords
- Limit database user permissions
- Enable SSL for database connections

### 4. Third-Party Services

- Rotate API keys regularly
- Use webhook signatures for verification
- Implement IP restrictions where possible

### 5. Environment Variables

- Never commit secrets to version control
- Use secret management services
- Limit access to production credentials

## Production Checklist

Before go-live, verify:

- [ ] All environment variables are correctly set
- [ ] Database migrations run successfully
- [ ] Stripe webhook routes are accessible
- [ ] Clerk webhooks are configured
- [ ] SSL is properly configured
- [ ] Rate limiting is in place
- [ ] Database backups are automated
- [ ] Monitoring is configured
- [ ] Error logging captures issues
- [ ] Load testing has been performed

## Scaling Considerations

As usage grows, consider:

1. **Database Scaling**:
   - Connection pooling
   - Read replicas for heavy read operations
   - Vertical scaling for write operations

2. **Application Scaling**:
   - Horizontal scaling with multiple instances
   - CDN for static assets
   - Caching layer for frequent data

3. **Cost Optimization**:
   - Resource rightsizing
   - Reserved instances for predictable loads
   - Autoscaling for variable traffic