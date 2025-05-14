#!/bin/bash

# Railway deployment script for Astrology AI Copilot
# This script automates the Railway deployment process

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}No .env.production file found. Creating from example...${NC}"
    if [ -f .env.production.example ]; then
        cp .env.production.example .env.production
        echo -e "${YELLOW}Please edit .env.production with your production values before continuing.${NC}"
        echo -e "${YELLOW}Press any key when you're ready to continue...${NC}"
        read -n 1 -s
    else
        echo -e "${RED}No .env.production.example file found. Please create a .env.production file manually.${NC}"
        exit 1
    fi
fi

# Prompt for Railway project
echo -e "${YELLOW}Select an option for Railway project:${NC}"
echo "1) Create a new project"
echo "2) Use existing project"
read -p "Enter your choice (1/2): " project_choice

if [ "$project_choice" -eq 1 ]; then
    echo -e "${YELLOW}Creating new Railway project...${NC}"
    railway init
elif [ "$project_choice" -eq 2 ]; then
    echo -e "${YELLOW}Linking to existing project...${NC}"
    railway link
else
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
fi

# Prompt for environment
echo -e "${YELLOW}Select environment to deploy to:${NC}"
echo "1) Production"
echo "2) Staging"
read -p "Enter your choice (1/2): " env_choice

if [ "$env_choice" -eq 1 ]; then
    ENVIRONMENT="production"
elif [ "$env_choice" -eq 2 ]; then
    ENVIRONMENT="staging"
    # Create staging environment if it doesn't exist
    railway environment | grep -q "staging" || railway environment create staging
    railway environment staging
else
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying to ${ENVIRONMENT} environment...${NC}"

# Provision PostgreSQL if needed
echo -e "${YELLOW}Do you need to provision a PostgreSQL database? (y/n)${NC}"
read -p "Enter your choice: " db_choice
if [[ $db_choice =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Provisioning PostgreSQL...${NC}"
    railway add postgresql
    echo -e "${GREEN}PostgreSQL provisioned!${NC}"
fi

# Provision Redis if needed
echo -e "${YELLOW}Do you need to provision Redis? (y/n)${NC}"
read -p "Enter your choice: " redis_choice
if [[ $redis_choice =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Provisioning Redis...${NC}"
    railway add redis
    echo -e "${GREEN}Redis provisioned!${NC}"
fi

# Set environment variables
echo -e "${YELLOW}Setting environment variables from .env.production...${NC}"
railway variables from .env.production
echo -e "${GREEN}Environment variables set!${NC}"

# Deploy to Railway
echo -e "${YELLOW}Deploying application to Railway...${NC}"
railway up
echo -e "${GREEN}Deployment initiated!${NC}"

# Run database migrations
echo -e "${YELLOW}Do you want to run database migrations? (y/n)${NC}"
read -p "Enter your choice: " migrations_choice
if [[ $migrations_choice =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    railway run npx prisma migrate deploy
    echo -e "${GREEN}Migrations completed!${NC}"
fi

# Display URL
echo -e "${YELLOW}Fetching deployment URL...${NC}"
DEPLOYMENT_URL=$(railway service list | grep -Eo 'https://[^ >]+')

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}URL not available yet. Please check the Railway dashboard.${NC}"
else
    echo -e "${GREEN}Your application is deployed at: ${DEPLOYMENT_URL}${NC}"
    echo -e "${YELLOW}Don't forget to update webhook URLs in Clerk and Stripe!${NC}"
fi

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${YELLOW}Refer to RAILWAY_CHECKLIST.md for post-deployment verification steps.${NC}"