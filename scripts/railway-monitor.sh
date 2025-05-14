#!/bin/bash

# Railway monitoring script for Astrology AI Copilot
# This script helps monitor the deployed application on Railway

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

# Function to display menu
show_menu() {
    clear
    echo -e "${BLUE}===== Astrology AI Copilot - Railway Monitoring =====${NC}"
    echo -e "${YELLOW}1) View logs${NC}"
    echo -e "${YELLOW}2) Check deployment status${NC}"
    echo -e "${YELLOW}3) Run database migrations${NC}"
    echo -e "${YELLOW}4) View environment variables${NC}"
    echo -e "${YELLOW}5) SSH into service${NC}"
    echo -e "${YELLOW}6) Switch environment (production/staging)${NC}"
    echo -e "${YELLOW}7) Restart service${NC}"
    echo -e "${YELLOW}8) Check health endpoint${NC}"
    echo -e "${YELLOW}9) Exit${NC}"
    echo
    echo -e "${BLUE}=================================================${NC}"
}

# Function to view logs
view_logs() {
    echo -e "${BLUE}Fetching logs...${NC}"
    echo
    railway logs
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to check deployment status
check_status() {
    echo -e "${BLUE}Checking deployment status...${NC}"
    echo
    railway status
    echo
    railway service list
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}Running database migrations...${NC}"
    echo
    railway run npx prisma migrate deploy
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to view environment variables
view_env_vars() {
    echo -e "${BLUE}Fetching environment variables...${NC}"
    echo
    railway variables get
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to SSH into service
ssh_service() {
    echo -e "${BLUE}Opening SSH session...${NC}"
    echo -e "${YELLOW}Type 'exit' to return to the menu when done.${NC}"
    echo
    railway ssh
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to switch environment
switch_environment() {
    echo -e "${BLUE}Current environment:${NC}"
    current_env=$(railway environment)
    echo -e "${YELLOW}$current_env${NC}"
    echo
    echo -e "${BLUE}Available environments:${NC}"
    railway environment list
    echo
    
    echo -e "${YELLOW}Enter environment name to switch to (or press Enter to cancel):${NC}"
    read env_name
    
    if [ -n "$env_name" ]; then
        railway environment "$env_name"
        echo -e "${GREEN}Switched to environment: $env_name${NC}"
    fi
    
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to restart service
restart_service() {
    echo -e "${BLUE}Restarting service...${NC}"
    echo
    railway service restart
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Function to check health endpoint
check_health() {
    echo -e "${BLUE}Fetching deployment URL...${NC}"
    DEPLOYMENT_URL=$(railway service list | grep -Eo 'https://[^ >]+')
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${RED}URL not available. Please check the Railway dashboard.${NC}"
    else
        echo -e "${BLUE}Checking health endpoint at ${DEPLOYMENT_URL}/api/health${NC}"
        echo
        curl -s "${DEPLOYMENT_URL}/api/health" | jq . || echo -e "${RED}Failed to fetch health data${NC}"
    fi
    
    echo
    echo -e "${GREEN}Press Enter to continue...${NC}"
    read
}

# Main loop
while true; do
    show_menu
    echo -e "${YELLOW}Enter your choice [1-9]:${NC}"
    read choice
    
    case $choice in
        1) view_logs ;;
        2) check_status ;;
        3) run_migrations ;;
        4) view_env_vars ;;
        5) ssh_service ;;
        6) switch_environment ;;
        7) restart_service ;;
        8) check_health ;;
        9) 
            echo -e "${GREEN}Exiting. Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Press Enter to continue...${NC}"
            read
            ;;
    esac
done