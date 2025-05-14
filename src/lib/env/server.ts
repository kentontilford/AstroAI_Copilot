import { z } from "zod";

/**
 * Server-side environment variables schema
 */
const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Clerk Auth
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_ASSISTANT_ID: z.string().min(1),

  // Google Maps (server side)
  GOOGLE_MAPS_API_KEY_SERVER: z.string().min(1),

  // App URL - needed for webhooks and callbacks
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

/**
 * Validate and parse server environment variables
 */
export const env = serverSchema.parse(process.env);

/**
 * Validate all environment variables on server startup
 */
export function validateEnv() {
  try {
    serverSchema.parse(process.env);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => issue.path.join('.'));
      const errorMessage = `❌ Missing or invalid environment variables: ${missingVars.join(', ')}`;
      return { valid: false, errors: errorMessage };
    }
    return { valid: false, errors: "Unknown error validating environment variables" };
  }
}