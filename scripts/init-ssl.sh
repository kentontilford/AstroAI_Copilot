#!/bin/bash

# SSL certificate initialization script for production deployment
# This script obtains SSL certificates using Let's Encrypt certbot

# Exit on any error
set -e

# Configuration variables
DOMAIN=${DOMAIN:-"astrology-ai-copilot.com"}
EMAIL=${EMAIL:-"admin@astrology-ai-copilot.com"}
STAGING=${STAGING:-0}  # Set to 1 for testing

# Print domain and email information
echo "Initializing SSL certificates for domain: $DOMAIN"
echo "Using email: $EMAIL"

# Create required directories
mkdir -p ./data/certbot/conf/live/$DOMAIN
mkdir -p ./data/certbot/www

# Check if we're in staging mode (for testing)
if [ "$STAGING" -eq 1 ]; then
    echo "Running in staging mode (testing certificates)"
    STAGING_FLAG="--staging"
else
    echo "Running in production mode (real certificates)"
    STAGING_FLAG=""
fi

# Use docker-compose to run certbot in standalone mode to get initial certificates
echo "Obtaining SSL certificates..."
docker-compose run --rm --entrypoint "\
  certbot certonly --standalone \
  $STAGING_FLAG \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal" certbot

echo "Certificate generation complete!"

# Generate a Diffie-Hellman parameter file for enhanced security
echo "Generating Diffie-Hellman parameters (this may take a while)..."
openssl dhparam -out ./data/certbot/conf/ssl-dhparams.pem 2048

echo "SSL certificate setup complete!"
echo "You can now start the application with docker-compose -f docker-compose.production.yml up -d"
echo "Certificates will auto-renew as needed."