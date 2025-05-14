/**
 * Security configuration for the application
 * Contains security headers and CORS settings
 */

// Security headers for the application
export const securityHeaders = [
  // DNS prefetch control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Strict Transport Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // XSS Protection header
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Prevent iframe embedding except from same origin
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  // Permissions policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
];

// CORS configuration for API routes
export const corsOptions = {
  // Define allowed origins
  allowedOrigins: process.env.NODE_ENV === 'production'
    ? [process.env.NEXT_PUBLIC_APP_URL as string] // Only the main app URL in production
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  
  // Define allowed methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Define allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  
  // Allow credentials
  credentials: true,
  
  // Cache preflight requests for 10 minutes
  maxAge: 600, // 10 minutes
};

// Function to apply CORS headers
export function applyCorsHeaders(req: Request, res: Response) {
  // Get the origin from the request
  const origin = req.headers.get('origin');
  
  // Check if the origin is allowed
  if (origin && corsOptions.allowedOrigins.includes(origin)) {
    // Set CORS headers
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Methods', corsOptions.allowedMethods.join(', '));
    res.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());
    
    if (corsOptions.credentials) {
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  return res;
}