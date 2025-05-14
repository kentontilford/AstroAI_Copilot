# Local Deployment Guide

This guide helps you run the Astrology AI Copilot app on your local machine.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Your `.env.local` file configured

## Step 1: Set Up Database

1. Start PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE astrology_app;
   ```

## Step 2: Configure Environment

1. Copy `.env.production.example` to `.env.local`
2. Update the `DATABASE_URL` to point to your local database:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/astrology_app
   ```
3. Fill in all required API keys

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Generate Prisma Client & Run Migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

## Step 5: Build & Start the App

```bash
npm run build
npm start
```

Your app will be running at http://localhost:3000

## Using Docker Compose (Alternative)

If you prefer Docker, use:

```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

Access at http://localhost:3000