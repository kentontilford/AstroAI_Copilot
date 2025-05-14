#!/bin/bash

# Simplified Railway deployment script for Astrology AI Copilot
# This script automates the Railway deployment process with minimal interaction

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting simplified Railway deployment...${NC}"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}Railway CLI installed successfully!${NC}"
fi

# Check if logged in to Railway
railway whoami &> /dev/null || {
    echo -e "${YELLOW}Not logged in to Railway. Please log in:${NC}"
    railway login
}

# Create new project if none exists
PROJECT_COUNT=$(railway project list 2>/dev/null | grep -c "Id" || echo "0")
if [ "$PROJECT_COUNT" -lt 1 ]; then
    echo -e "${YELLOW}No Railway projects found. Creating a new one...${NC}"
    railway init --name "astrology-ai-copilot"
else
    echo -e "${YELLOW}Existing projects found. Linking to first available project...${NC}"
    railway link
fi

# Set environment to production
echo -e "${YELLOW}Setting environment to production...${NC}"
railway environment production 2>/dev/null || railway environment create production

# Provision PostgreSQL if needed
echo -e "${YELLOW}Checking for PostgreSQL...${NC}"
SERVICE_COUNT=$(railway service list 2>/dev/null | grep -c "postgresql" || echo "0")
if [ "$SERVICE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}Provisioning PostgreSQL...${NC}"
    railway add postgresql --environment production
    echo -e "${GREEN}PostgreSQL provisioned!${NC}"
fi

# Set environment variables from .env.production
echo -e "${YELLOW}Setting environment variables from .env.production...${NC}"
# Read each line from .env.production and set as variable
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! $line =~ ^# && -n $line ]]; then
        # Extract variable name and value
        var_name=$(echo "$line" | cut -d= -f1)
        var_value=$(echo "$line" | cut -d= -f2-)
        
        # Set environment variable in Railway
        echo "Setting $var_name..."
        railway variables set "$var_name=$var_value" --environment production
    fi
done < .env.production

# Deploy to Railway
echo -e "${YELLOW}Deploying application to Railway...${NC}"
railway up --environment production
echo -e "${GREEN}Deployment initiated!${NC}"

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
railway run --environment production npx prisma migrate deploy
echo -e "${GREEN}Migrations completed!${NC}"

# Display URL
echo -e "${YELLOW}Fetching deployment URL...${NC}"
sleep 10 # Wait for deployment to register
DEPLOYMENT_URL=$(railway service list | grep -Eo 'https://[^ >]+' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}URL not available yet. Please check the Railway dashboard.${NC}"
else
    echo -e "${GREEN}Your application is deployed at: ${DEPLOYMENT_URL}${NC}"
    echo -e "${YELLOW}Don't forget to update webhook URLs in Clerk and Stripe!${NC}"
fi

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Your app is being built and will be available soon at: https://astrology-ai-copilot.up.railway.app${NC}"