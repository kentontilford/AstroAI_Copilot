import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

// In-memory cache for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimit = new NodeCache({
  stdTTL: 60, // Default TTL: 60 seconds
  checkperiod: 5, // Check expired keys every 5 seconds
});

type RateLimitConfig = {
  // Maximum number of requests allowed within the window
  limit: number;
  
  // Time window in seconds
  windowSizeInSeconds: number;
  
  // Optional identifier for the rate limit (defaults to the route path)
  identifier?: string;
};

/**
 * Default rate limit configurations for different types of routes
 */
export const rateLimitConfigs = {
  // Authentication-related routes
  auth: {
    limit: 10,
    windowSizeInSeconds: 60, // 10 requests per minute
  },
  
  // API routes with high computational cost
  heavyComputation: {
    limit: 20,
    windowSizeInSeconds: 60, // 20 requests per minute
  },
  
  // Standard API routes
  standard: {
    limit: 60,
    windowSizeInSeconds: 60, // 60 requests per minute
  },
  
  // Webhooks from trusted services
  webhook: {
    limit: 100,
    windowSizeInSeconds: 60, // 100 requests per minute
  },
};

/**
 * Get client IP from request
 */
function getClientIp(req: NextRequest): string {
  // Try to get the real IP if behind a proxy
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get the first IP if multiple are provided
    return forwardedFor.split(',')[0].trim();
  }
  
  // Get the direct IP (may be the proxy's IP in production)
  const ip = req.ip || '127.0.0.1';
  return ip;
}

/**
 * Check if a request is rate limited
 */
function isRateLimited(
  req: NextRequest,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetInSeconds: number } {
  const { limit, windowSizeInSeconds, identifier } = config;
  
  // Create a key based on the client IP and route path or custom identifier
  const ip = getClientIp(req);
  const path = identifier || req.nextUrl.pathname;
  const key = `ratelimit:${ip}:${path}`;
  
  // Get current request count and timestamp
  const now = Math.floor(Date.now() / 1000);
  const requestData = rateLimit.get<{ count: number; timestamp: number }>(key);
  
  // If no existing data, this is the first request
  if (!requestData) {
    rateLimit.set(key, { count: 1, timestamp: now }, windowSizeInSeconds);
    return { limited: false, remaining: limit - 1, resetInSeconds: windowSizeInSeconds };
  }
  
  // Check if the window has expired
  const elapsed = now - requestData.timestamp;
  if (elapsed >= windowSizeInSeconds) {
    // Window expired, reset the counter
    rateLimit.set(key, { count: 1, timestamp: now }, windowSizeInSeconds);
    return { limited: false, remaining: limit - 1, resetInSeconds: windowSizeInSeconds };
  }
  
  // Check if the limit is exceeded
  if (requestData.count >= limit) {
    const resetIn = windowSizeInSeconds - elapsed;
    return { limited: true, remaining: 0, resetInSeconds: resetIn };
  }
  
  // Increment the counter
  rateLimit.set(key, { count: requestData.count + 1, timestamp: requestData.timestamp }, windowSizeInSeconds - elapsed);
  return { limited: false, remaining: limit - requestData.count - 1, resetInSeconds: windowSizeInSeconds - elapsed };
}

/**
 * Rate limiting middleware for API routes
 */
export function rateLimiter(config: RateLimitConfig) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      const { limited, remaining, resetInSeconds } = isRateLimited(req, config);
      
      // Add rate limit headers to the response
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', config.limit.toString());
      headers.set('X-RateLimit-Remaining', remaining.toString());
      headers.set('X-RateLimit-Reset', resetInSeconds.toString());
      
      // If rate limited, return 429 Too Many Requests
      if (limited) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later.' },
          { status: 429, headers }
        );
      }
      
      // Process the request
      const response = await handler(req);
      
      // Add headers to the response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    };
  };
}

/**
 * Apply rate limiting middleware with a predefined configuration
 */
export function applyRateLimit(
  configKey: keyof typeof rateLimitConfigs,
  customConfig?: Partial<RateLimitConfig>
) {
  const baseConfig = rateLimitConfigs[configKey];
  const config = {
    ...baseConfig,
    ...customConfig,
  };
  
  return rateLimiter(config);
}