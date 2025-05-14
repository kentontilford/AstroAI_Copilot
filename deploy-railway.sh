#!/bin/bash
set -e

echo "==== Astrology AI Copilot Railway Deployment Script ===="
echo "This script will deploy the application to Railway"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging in to Railway..."
railway login

# Check if a project is already linked
if ! railway project; then
    echo "Initializing new Railway project..."
    railway init
    echo "Please select 'Astrology AI Copilot' as the project name"
fi

# Create production environment if it doesn't exist
echo "Setting up production environment..."
if ! railway environment list | grep -q "production"; then
    railway environment create production
fi

# Switch to production environment
railway environment production

# Add PostgreSQL if not already added
echo "Setting up PostgreSQL..."
railway add postgresql

# Load environment variables from .env.production
echo "Setting environment variables from .env.production..."
if [ -f .env.production ]; then
    # Load each line as an environment variable and set in Railway
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        if [[ -z "$key" || $key == \#* ]]; then
            continue
        fi
        
        # Clean up the value (remove quotes if present)
        value=$(echo $value | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        echo "Setting $key"
        railway variables set "$key=$value"
    done < .env.production
else
    echo "Error: .env.production file not found!"
    exit 1
fi

# Deploy the application
echo "Deploying application..."
railway up

# Run database migrations
echo "Running database migrations..."
railway run npx prisma migrate deploy

# Get the deployment URL
echo "Deployment completed!"
echo "Your application is now available at:"
railway service

echo "==== Post-Deployment Steps ===="
echo "1. Update Clerk webhook: https://your-app-url.up.railway.app/api/clerk/webhook"
echo "2. Update Stripe webhook: https://your-app-url.up.railway.app/api/stripe/webhook"
echo "3. Monitor logs with: railway logs"