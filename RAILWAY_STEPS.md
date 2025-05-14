# Railway Deployment Steps

Follow these steps in order to deploy the application to Railway:

## 1. Login to Railway

```bash
railway login
```

## 2. Create or Link to Project

```bash
# Create a new project
railway init
```

Select a name like "astrology-ai-copilot" when prompted.

## 3. Add PostgreSQL Database

Go to the Railway dashboard at https://railway.app and:

1. Open your project
2. Click "New Service" → "Database" → "PostgreSQL"
3. Wait for provisioning to complete

## 4. Create the Next.js Service

In the Railway dashboard:

1. Click "New Service" → "GitHub Repo"
2. Select your repository
3. Configure the deployment settings:
   - Root Directory: `/` (root of the repository)
   - Build Command: `npm run build`
   - Start Command: `npm run start`

## 5. Set Environment Variables

In the Railway dashboard:

1. Go to your Next.js service
2. Click on the "Variables" tab
3. Click "Raw Editor"
4. Paste all the contents from your `.env.production` file

OR

```bash
# Use variables from file (with real values, not placeholders)
railway variables from .env.production
```

## 6. Deploy the Application

The application should deploy automatically after setting up GitHub integration.

For manual deployment:
```bash
railway up
```

## 7. Run Database Migrations

```bash
railway run npx prisma migrate deploy
```

## 8. Monitor Deployment

```bash
railway logs
```

## 9. Get Application URL

In the Railway dashboard, click on your service's "Settings" tab to find the generated URL.

OR

```bash
railway service
```

## 10. Post-Deployment Configuration

1. Update Clerk webhook: `https://your-app-url.up.railway.app/api/clerk/webhook`
2. Update Stripe webhook: `https://your-app-url.up.railway.app/api/stripe/webhook`
3. Verify all functionality works in production

## Troubleshooting

- **Deployment failures**: Check logs with `railway logs`
- **Database connection issues**: Verify DATABASE_URL variable is correct
- **Environment variables missing**: Check variables in dashboard or with `railway variables`