# Railway Deployment Checklist

Use this checklist to ensure a smooth deployment to Railway.

## Pre-Deployment

### Repository Setup
- [ ] Ensure your code is in a Git repository
- [ ] Verify all deployment files are committed:
  - [ ] `railway.toml`
  - [ ] `next.config.js`
  - [ ] Updated environment examples

### Environment Variables
- [ ] Create a `.env.production` file based on `.env.production.example`
- [ ] Fill in all required environment variables with production values
- [ ] Ensure `NEXT_PUBLIC_APP_URL` is set to your Railway URL or custom domain

### Third-Party Services
- [ ] Create production Clerk application
  - [ ] Configure production redirect URLs
  - [ ] Set up production webhook endpoints
- [ ] Set up Stripe in production mode
  - [ ] Create production webhook endpoints
  - [ ] Verify correct product and price IDs
- [ ] Configure OpenAI with appropriate rate limits
- [ ] Set up Google Maps API with domain restrictions

### Database Preparation
- [ ] Finalize database schema
- [ ] Ensure all migrations are tested
- [ ] Prepare any seed data needed for production

## Deployment Process

### Railway Setup
- [ ] Install Railway CLI: `npm i -g @railway/cli`
- [ ] Log in to Railway: `railway login`
- [ ] Initialize project: `railway init`
- [ ] Provision PostgreSQL database: `railway add postgresql`
- [ ] (Optional) Provision Redis: `railway add redis`

### Environment Configuration
- [ ] Import environment variables: `railway variables from .env.production`
- [ ] Verify all variables were imported correctly

### Deployment
- [ ] Deploy the application: `railway up`
- [ ] Run database migrations: `railway run npx prisma migrate deploy`
- [ ] Link to GitHub for continuous deployment (optional)

### Domain Setup
- [ ] Configure domain in Railway dashboard
- [ ] Set up SSL (automatic with Railway)
- [ ] Update DNS records if using custom domain

## Post-Deployment Verification

### Basic Functionality
- [ ] Verify the application loads: `https://[your-project].up.railway.app`
- [ ] Check the health endpoint: `https://[your-project].up.railway.app/api/health`
- [ ] Test signup and login flows
- [ ] Verify database connections

### Third-Party Integrations
- [ ] Test Clerk authentication flow
- [ ] Verify Clerk webhooks are working
- [ ] Test Stripe payment process
- [ ] Verify Stripe webhooks are receiving events
- [ ] Test OpenAI integration
- [ ] Verify Google Maps functionality

### Performance and Monitoring
- [ ] Observe application logs: `railway logs`
- [ ] Set up alert thresholds
- [ ] Test application under load
- [ ] Check memory and CPU usage

## Final Steps

### Documentation
- [ ] Update documentation with production URLs
- [ ] Document maintenance procedures
- [ ] Create emergency contact list

### Training and Handoff
- [ ] Train team on deployment process
- [ ] Document common issues and solutions
- [ ] Set up access control for Railway dashboard