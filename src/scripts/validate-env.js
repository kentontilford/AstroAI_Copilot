require('dotenv').config();
const { validateEnv } = require('../lib/env/server');

// Run environment validation
const result = validateEnv();

if (!result.valid) {
  console.error('\x1b[31m%s\x1b[0m', result.errors);
  console.error('\x1b[31m%s\x1b[0m', 'Environment validation failed. Please check your .env file.');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', '✅ Environment variables validated successfully!');
}