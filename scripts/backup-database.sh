#!/bin/bash

# Database backup script for Astrology AI Copilot
# Creates encrypted backups and manages retention

# Exit on any error
set -e

# Load environment variables
if [ -f .env.production ]; then
  export $(grep -v '^#' .env.production | xargs)
elif [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Configuration
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
RETENTION_DAYS=${RETENTION_DAYS:-30}
ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY:-""}
DB_URL=${DATABASE_URL}

# Timestamp for the backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/astrology_ai_copilot_$TIMESTAMP.sql"
ENCRYPTED_FILE="$BACKUP_FILE.enc"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Extract database connection info from URL
# postgresql://username:password@host:port/database
if [[ $DB_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
  DB_USER="${BASH_REMATCH[1]}"
  DB_PASS="${BASH_REMATCH[2]}"
  DB_HOST="${BASH_REMATCH[3]}"
  DB_PORT="${BASH_REMATCH[4]}"
  DB_NAME="${BASH_REMATCH[5]}"
  
  # Remove query parameters if present
  DB_NAME=${DB_NAME%%\?*}
  
  echo "Backing up database: $DB_NAME on $DB_HOST"
  
  # Set up environment variable for password
  export PGPASSWORD="$DB_PASS"
  
  # Create SQL dump
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c > "$BACKUP_FILE"
  
  # Encrypt backup if encryption key is provided
  if [ -n "$ENCRYPTION_KEY" ]; then
    echo "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -in "$BACKUP_FILE" -out "$ENCRYPTED_FILE" -pass pass:"$ENCRYPTION_KEY"
    rm "$BACKUP_FILE"
    BACKUP_FILE="$ENCRYPTED_FILE"
  fi
  
  # Calculate backup size
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  
  echo "Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"
  
  # Clean up old backups
  find "$BACKUP_DIR" -name "astrology_ai_copilot_*.sql*" -type f -mtime +$RETENTION_DAYS -delete
  
  echo "Removed backups older than $RETENTION_DAYS days"
  echo "Backup process completed successfully"
else
  echo "Error: Could not parse DATABASE_URL"
  exit 1
fi