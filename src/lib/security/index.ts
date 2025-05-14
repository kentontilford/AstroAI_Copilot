export * from './csrf';
export * from './rate-limit';
export * from './sanitize';

import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from './csrf';
import { applyRateLimit, rateLimitConfigs } from './rate-limit';
import { sanitize } from './sanitize';
import { z } from 'zod';

/**
 * Secure handler middleware that applies multiple security measures
 * 
 * @param handler The original API route handler
 * @param options Security options to apply
 * @returns A middleware-wrapped handler function
 */
export function secureHandler<T>(
  handler: (req: NextRequest, validatedData?: T) => Promise<NextResponse>,
  options: {
    // Schema for input validation
    schema?: z.ZodSchema<T>;
    
    // Enable CSRF protection (default: true for state-changing methods)
    csrfProtection?: boolean;
    
    // Rate limiting configuration
    rateLimit?: {
      type: keyof typeof rateLimitConfigs;
      custom?: {
        limit?: number;
        windowSizeInSeconds?: number;
        identifier?: string;
      };
    };
    
    // Sanitize request data
    sanitizeInput?: boolean;
  } = {}
) {
  const {
    schema,
    csrfProtection = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET'),
    rateLimit,
    sanitizeInput = true,
  } = options;
  
  return async (req: NextRequest) => {
    try {
      // Apply rate limiting if configured
      if (rateLimit) {
        const rateLimitMiddleware = applyRateLimit(rateLimit.type, rateLimit.custom);
        const limitedRequest = await rateLimitMiddleware((r) => Promise.resolve(new NextResponse()))(req);
        
        // If rate limited, return the rate limit response
        if (limitedRequest.status === 429) {
          return limitedRequest;
        }
      }
      
      // Verify CSRF token if enabled
      if (csrfProtection && !verifyCsrfToken(req)) {
        return NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 });
      }
      
      // Validate input schema if provided
      let validatedData: T | undefined;
      if (schema) {
        try {
          const body = await req.json();
          
          // Sanitize input if enabled
          const processedBody = sanitizeInput ? sanitize(body) : body;
          
          // Validate using Zod
          validatedData = schema.parse(processedBody);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Validation failed', details: error.errors },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: 'Invalid request data' },
            { status: 400 }
          );
        }
      }
      
      // Call the original handler with validated data
      return handler(req, validatedData);
    } catch (error) {
      console.error('Error in secure handler:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}