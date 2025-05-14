#!/usr/bin/env node

/**
 * Environment variable validation script
 * 
 * This script checks that all required environment variables are set
 * before running the application to prevent runtime errors.
 */

const requiredVariables = [
  // Clerk Authentication
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'CLERK_WEBHOOK_SECRET',
  
  // Stripe
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
  
  // OpenAI
  'OPENAI_API_KEY',
  'OPENAI_ASSISTANT_ID',
  
  // Google Maps
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAPS_API_KEY_SERVER',
  
  // Database
  'DATABASE_URL',
  
  // App Settings
  'NEXT_PUBLIC_APP_URL',
];

// Variables required only in production
const productionVariables = [
  'NODE_ENV',
];

// Load environment variables from file
require('dotenv').config();

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Variables to check based on environment
const variablesToCheck = isProduction 
  ? [...requiredVariables, ...productionVariables]
  : requiredVariables;

// Check for missing variables
const missingVariables = variablesToCheck.filter(varName => {
  const value = process.env[varName];
  return value === undefined || value === '';
});

// Format validation output
if (missingVariables.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Environment validation failed!');
  console.error('\x1b[31m%s\x1b[0m', 'The following required environment variables are missing:');
  
  missingVariables.forEach(varName => {
    console.error('\x1b[33m%s\x1b[0m', `- ${varName}`);
  });
  
  console.error('\x1b[31m%s\x1b[0m', '\nPlease set these variables in your .env file before starting the application.');
  
  // Exit with error code
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Environment validation successful!');
  console.log('\x1b[32m%s\x1b[0m', 'All required environment variables are set.');
  
  // Verify database URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Warning: DATABASE_URL should start with postgresql://');
  }
  
  // Verify app URL format
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (isProduction && !appUrl.startsWith('https://')) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Warning: In production, NEXT_PUBLIC_APP_URL should use HTTPS');
  }
  
  console.log('\x1b[32m%s\x1b[0m', 'The application is ready to start!');
  
  // Exit successfully
  process.exit(0);
}