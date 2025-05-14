# Railway Docker Deployment Guide

This guide provides detailed instructions for deploying the Astrology AI Copilot application to Railway using Docker.

## Option 1: Deploy using Dockerfile.simple

This approach uses our simplified Dockerfile for easier deployment.

### Step-by-Step Instructions

1. **Access Railway Dashboard**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Log in with your account

2. **Create a New Project (if needed)**
   - Click "New Project" button
   - Select "Deploy from GitHub repo"

3. **Configure GitHub Repository**
   - Select your repository: `kentontilford/AstroAI_Copilot`
   - If not listed, click "Configure GitHub App" and grant access

4. **Configure Deployment Settings**
   - In the deployment configuration screen:
     - For "Root Directory" leave as `/` (root of the repository)
     - Set "Docker Command" to: `docker build -f Dockerfile.simple -t app .`
     - Toggle ON the "Private Repository" option if your repo is private

5. **Set Environment Variables**
   - Click on the "Variables" tab
   - Click "Raw Editor"
   - Paste all contents from your `.env.production` file
   - Make sure all keys and values are correct (no placeholders)
   - Click "Save Variables"

6. **Add PostgreSQL Database**
   - Click "New" button
   - Select "Database"
   - Choose "PostgreSQL"
   - Wait for provisioning to complete (may take a few minutes)

7. **Link Database to App Service**
   - After the database is provisioned, go to your app service
   - Click "Variables" tab
   - Add a new variable: `DATABASE_URL` with value: `${{Postgres.DATABASE_URL}}`
   - This links your app to the PostgreSQL instance

8. **Deploy Application**
   - Click "Deploy" button
   - Watch the deployment logs for any errors

9. **Run Database Migrations**
   - After deployment succeeds, open the service's terminal (Settings → Terminal)
   - Run: `npx prisma migrate deploy`
   - This applies all database migrations

10. **Access Your Application**
    - Find your public URL in the "Settings" tab under "Domains"
    - The URL will look like: `https://astrology-ai-copilot-production.up.railway.app`

## Option 2: Deploy without Docker (Node.js directly)

If Docker deployment continues to fail, try deploying using Railway's Node.js runtime directly.

### Step-by-Step Instructions

1. **Access Railway Dashboard**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Log in with your account

2. **Create a New Project (if needed)**
   - Click "New Project" button
   - Select "Deploy from GitHub repo"

3. **Configure GitHub Repository**
   - Select your repository: `kentontilford/AstroAI_Copilot` 
   - If not listed, click "Configure GitHub App" and grant access

4. **Configure Deployment Settings**
   - In the deployment configuration screen:
     - For "Root Directory" leave as `/` (root of the repository)
     - Set "Builder" to "Nixpacks"
     - Set "Build Command" to: `npm install && npx prisma generate && npm run build`
     - Set "Start Command" to: `npm start`
     - Toggle OFF the "Docker" option

5. **Set Environment Variables**
   - Click on the "Variables" tab
   - Click "Raw Editor"
   - Paste all contents from your `.env.production` file
   - Make sure all keys and values are correct (no placeholders)
   - Click "Save Variables"

6. **Add PostgreSQL Database**
   - Click "New" button
   - Select "Database"
   - Choose "PostgreSQL"
   - Wait for provisioning to complete (may take a few minutes)

7. **Link Database to App Service**
   - After the database is provisioned, go to your app service
   - Click "Variables" tab
   - Add a new variable: `DATABASE_URL` with value: `${{Postgres.DATABASE_URL}}`
   - This links your app to the PostgreSQL instance

8. **Deploy Application**
   - Click "Deploy" button
   - Watch the deployment logs for any errors

9. **Run Database Migrations**
   - After deployment succeeds, open the service's terminal (Settings → Terminal)
   - Run: `npx prisma migrate deploy`
   - This applies all database migrations

10. **Access Your Application**
    - Find your public URL in the "Settings" tab under "Domains"
    - The URL will look like: `https://astrology-ai-copilot-production.up.railway.app`

## Troubleshooting Common Issues

### Issue: Build Fails with npm install error

**Solution 1:** Try using Node.js 16 instead of 18
- Go to service settings
- Add environment variable: `NODE_VERSION=16.x`

**Solution 2:** Install specific dependencies
- Go to service settings
- Add environment variable: `NIXPACKS_PKGS=python3 build-base`

### Issue: Prisma Database Connection Errors

**Solution:**
- Verify `DATABASE_URL` is correctly linked to your PostgreSQL service
- Ensure the PostgreSQL service is running
- Check for any firewall or network restrictions

### Issue: Unable to Access Application After Deployment

**Solution:**
- Check deployment logs for errors
- Verify the application is listening on the correct port (PORT=3000)
- Make sure environment variables are properly set
- Confirm migrations have been applied

### Issue: Memory or CPU Issues

**Solution:**
- Go to service settings
- Increase memory allocation
- If on free tier, consider upgrading to a paid plan

## Post-Deployment Steps

1. **Update Webhook URLs**
   - Clerk webhook: `https://your-app-url.up.railway.app/api/clerk/webhook`
   - Stripe webhook: `https://your-app-url.up.railway.app/api/stripe/webhook`

2. **Verify Functionality**
   - Test authentication flow (signup, login)
   - Test payment processing
   - Test AI assistant functionality
   - Check all core features of the application

3. **Monitor Application**
   - Use Railway's built-in monitoring
   - Check logs regularly: `railway logs`
   - Set up alerts for important events