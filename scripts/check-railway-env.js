#!/usr/bin/env node

/**
 * Check environment variables for Railway deployment
 * This script analyzes your Railway environment variables
 */

require('dotenv').config({ path: '.env.production' });

// Variables needed for Railway deployment
const criticalVariables = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
  'OPENAI_API_KEY',
  'OPENAI_ASSISTANT_ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'GOOGLE_MAPS_API_KEY_SERVER',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
];

// Optional variables that are helpful but not required
const optionalVariables = [
  'REDIS_PASSWORD',
  'ANALYZE',
  'DATABASE_URL', // Railway will set this automatically
];

// Check all critical variables
const missingVariables = [];
const placeholderVariables = [];
const validVariables = [];

console.log('✅ Checking critical environment variables for Railway deployment...\n');

criticalVariables.forEach(varName => {
  const value = process.env[varName];
  
  if (!value) {
    missingVariables.push(varName);
  } else if (
    value.includes('your_') || 
    value === 'undefined' || 
    value === 'null' ||
    value.includes('example') ||
    value.includes('placeholder')
  ) {
    placeholderVariables.push(varName);
  } else {
    validVariables.push(varName);
  }
});

// Perform URL validation for app URL
if (process.env.NEXT_PUBLIC_APP_URL && !missingVariables.includes('NEXT_PUBLIC_APP_URL')) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
    if (!url.protocol.startsWith('http')) {
      console.log('⚠️ Warning: NEXT_PUBLIC_APP_URL should start with http:// or https://');
    }
  } catch (e) {
    console.log('⚠️ Warning: NEXT_PUBLIC_APP_URL is not a valid URL');
  }
}

// Print results
console.log('🟢 Valid variables:');
validVariables.forEach(varName => {
  let value = process.env[varName];
  // Mask sensitive values
  if (varName.includes('KEY') || varName.includes('SECRET')) {
    value = value.substring(0, 3) + '...' + value.substring(value.length - 3);
  }
  console.log(`  - ${varName}: ${value}`);
});

console.log('\n🟠 Placeholder or example values detected:');
if (placeholderVariables.length === 0) {
  console.log('  None - all set values appear valid');
} else {
  placeholderVariables.forEach(varName => {
    console.log(`  - ${varName}: ${process.env[varName]}`);
  });
}

console.log('\n🔴 Missing variables:');
if (missingVariables.length === 0) {
  console.log('  None - all critical variables are set');
} else {
  missingVariables.forEach(varName => {
    console.log(`  - ${varName}`);
  });
}

// Optional variables
console.log('\n🔵 Optional variables:');
optionalVariables.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`  - ${varName}: Not set (optional)`);
  } else {
    let displayValue = value;
    // Mask sensitive values
    if (varName.includes('PASSWORD') || varName.includes('DATABASE_URL')) {
      displayValue = displayValue.substring(0, 3) + '...' + displayValue.substring(displayValue.length - 3);
    }
    console.log(`  - ${varName}: ${displayValue}`);
  }
});

// Summary
console.log('\n📊 Summary:');
console.log(`  - ${validVariables.length} valid variables`);
console.log(`  - ${placeholderVariables.length} variables with placeholder values`);
console.log(`  - ${missingVariables.length} missing variables`);

// Final recommendation
if (missingVariables.length > 0 || placeholderVariables.length > 0) {
  console.log('\n⚠️ Action needed: ');
  console.log('  Create a proper .env.production file with all required variables');
  console.log('  Run: cp .env.production.example .env.production');
  console.log('  Then edit .env.production with your actual values');
  process.exit(1);
} else {
  console.log('\n✅ All critical environment variables are properly set for Railway deployment!');
  process.exit(0);
}