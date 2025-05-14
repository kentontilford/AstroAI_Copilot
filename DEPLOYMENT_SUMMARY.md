# Deployment Summary

This document provides a comprehensive overview of the deployment architecture and processes for the Astrology AI Copilot application.

## 1. Deployment Architecture

### Docker Configuration
The application uses a multi-stage Docker build process:
- **Stage 1 (deps)**: Installs Node.js dependencies
- **Stage 2 (builder)**: Builds the Next.js application and generates Prisma client
- **Stage 3 (runner)**: Creates a lightweight production container with only necessary files

The containerized architecture includes:
- **Next.js Application**: The core application running on Node.js
- **PostgreSQL Database**: Persistent storage for user data and astrological profiles
- **Redis**: Used for caching and session management
- **Nginx**: Reverse proxy for SSL termination and request routing
- **Certbot**: Automatic SSL certificate management

### Railway Configuration
Railway provides a managed platform for deploying the application:
- Build configuration in `railway.toml` specifies:
  - Build command: `npm run build`
  - Start command: `npm run start`
  - Health check endpoint: `/api/health`
  - Restart policy: On failure with 5 max retries
- Environment-specific configurations for staging and production

### Component Interaction
1. User requests hit the Nginx reverse proxy first
2. Nginx routes requests to the Next.js application
3. The application communicates with:
   - PostgreSQL for data persistence
   - Redis for caching
   - External APIs (OpenAI, Clerk, Stripe, Google Maps)
4. Health checks ensure system stability
5. Certbot automatically manages SSL certificates

## 2. Environment Configuration

The following environment variables are required:

### Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<publishable_key>
CLERK_SECRET_KEY=<secret_key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/personal
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/birth-profile
CLERK_WEBHOOK_SECRET=<webhook_secret>
```

### Payment Processing (Stripe)
```
STRIPE_PUBLISHABLE_KEY=<publishable_key>
STRIPE_SECRET_KEY=<secret_key>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
STRIPE_PRICE_ID=<price_id>
```

### AI Integration (OpenAI)
```
OPENAI_API_KEY=<api_key>
OPENAI_ASSISTANT_ID=<assistant_id>
```

### Geolocation (Google Maps)
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<client_key>
GOOGLE_MAPS_API_KEY_SERVER=<server_key>
```

### Database
```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
REDIS_URL=redis://<host>:<port>
REDIS_PASSWORD=<password>
```

### Application Settings
```
NEXT_PUBLIC_APP_URL=<app_url>
NODE_ENV=production
DB_USER=<database_user>
DB_PASSWORD=<database_password>
DB_NAME=<database_name>
```

## 3. Deployment Steps

### Railway Deployment Process

1. **Prerequisites**
   - Install Railway CLI: `npm install -g @railway/cli`
   - Log in to Railway: `railway login`

2. **Project Setup**
   - Create a new project: `railway init`
   - Or link to existing project: `railway link`

3. **Environment Configuration**
   - Create `.env.production` from the example template
   - Upload environment variables: `railway variables from .env.production`

4. **Service Provisioning**
   - Add PostgreSQL: `railway add postgresql`
   - Add Redis: `railway add redis`

5. **Deployment**
   - Deploy the application: `railway up`
   - Run database migrations: `railway run npx prisma migrate deploy`

6. **Verification**
   - Check deployment status: `railway status`
   - View application logs: `railway logs`
   - Access the application URL from the Railway dashboard

### Vercel Deployment (Alternative)

1. **Prerequisites**
   - Push code to a Git repository
   - Have a Vercel account

2. **Deployment**
   - Connect repository to Vercel
   - Configure environment variables
   - Deploy with default settings

### Docker Compose Deployment (Alternative)

1. **Prerequisites**
   - Docker and Docker Compose installed
   - Environment variables configured in `.env.production`

2. **Deployment**
   - Build and start services: `docker-compose -f docker-compose.production.yml up -d`
   - Monitor container health: `docker-compose -f docker-compose.production.yml ps`

3. **SSL Setup**
   - Initialize SSL certificates: `./scripts/init-ssl.sh yourdomain.com`
   - Nginx automatically routes HTTP traffic to HTTPS

## 4. GitHub Repository Setup

### Repository Structure
The repository is organized as follows:

```
/
├── .github/workflows/     # CI/CD workflows
├── prisma/                # Database schema and migrations
├── public/                # Static assets
│   └── ephe/              # Ephemeris files for astrological calculations
├── scripts/               # Deployment and utility scripts
├── src/                   # Application source code
│   ├── app/               # Next.js application routes and API
│   ├── components/        # React components
│   ├── lib/               # Core libraries and utilities
│   │   ├── astrology/     # Astrological calculation services
│   │   ├── auth/          # Authentication utilities
│   │   ├── db/            # Database utilities
│   │   └── security/      # Security implementations
├── .gitignore             # Git ignore file
├── docker-compose.yml     # Development Docker configuration
├── docker-compose.production.yml # Production Docker configuration
├── Dockerfile             # Docker build instructions
├── next.config.js         # Next.js configuration
├── nginx.conf             # Nginx server configuration
├── package.json           # Node.js dependencies
└── railway.toml           # Railway deployment configuration
```

### CI/CD Pipeline
The GitHub Actions workflow handles:
1. Code linting and testing
2. Building the Next.js application
3. Building and pushing Docker images
4. Deploying to staging automatically
5. Manual approval for production deployment

### Branch Protection
- `main` branch is protected from direct pushes
- Pull requests require code review and passing tests
- Sensitive files are excluded via `.gitignore`

## 5. Security Considerations

### API Key Management
- All API keys are stored as environment variables
- Different keys for development and production environments
- Keys are never committed to the repository

### Authentication Security
- Clerk provides secure authentication with MFA support
- JWT-based session management
- Authorization checks on all protected routes

### Data Protection
- All communication uses HTTPS with proper SSL configuration
- Sensitive user data (birth details) is stored securely
- Input validation and sanitization for all user inputs

### Rate Limiting
- API routes have rate limiting to prevent abuse
- Different rate limits based on endpoint sensitivity
- Nginx provides additional rate limiting at the server level

### CSRF Protection
- Cross-Site Request Forgery protection for all state-changing operations
- Token-based protection with secure HTTP-only cookies
- Double submit cookie pattern implementation

### Database Security
- Database credentials are never exposed
- Parameterized queries with Prisma
- Database user with minimal required permissions

## 6. Monitoring and Maintenance

### Health Checks
- `/api/health` endpoint reports system status
- Checks database connectivity
- Returns service health information
- Used by container orchestration for auto-recovery

### Logging
- Structured JSON logs for better parsing
- Request IDs for tracing through the system
- Production logs exclude sensitive information
- Nginx logs for access and errors

### Monitoring Tools
- Railway provides basic monitoring
- Recommended additional tools:
  - Sentry for error tracking
  - LogRocket for session replay
  - Datadog or New Relic for comprehensive monitoring

### Alerting
- Set up alerts for:
  - Application errors
  - High latency responses
  - Database connectivity issues
  - Memory or CPU threshold breaches

### Database Maintenance
- Regular backups (use `scripts/backup-database.sh`)
- Database migrations run automatically on deployment
- Monitoring for database performance

## 7. Post-Deployment Tasks

### Immediate Verification
- Verify the application loads correctly
- Test authentication flows
- Test payment processing
- Verify astrology calculations

### Third-Party Service Configuration
- Update webhook URLs in Clerk dashboard
- Update webhook endpoints in Stripe dashboard
- Configure CORS settings for production domain
- Verify Google Maps API domain restrictions

### DNS Configuration
- If using a custom domain, update DNS records
- Set up proper redirects from www to non-www (or vice versa)
- Verify SSL certificate issuance and renewal

### Performance Testing
- Run load tests to verify application scalability
- Check response times for critical endpoints
- Optimize database queries if needed

### Documentation Update
- Update any documentation with production URLs
- Document common operational procedures
- Create runbooks for incident response

### Backup Verification
- Test database backup and restore procedures
- Verify automated backup scheduling
- Document disaster recovery procedures

---

This deployment summary provides a comprehensive overview of the deployment architecture, processes, and best practices for the Astrology AI Copilot application. Refer to specific documentation files for more detailed information on individual components.