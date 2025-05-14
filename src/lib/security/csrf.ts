import { randomBytes, createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generates a new CSRF token and sets it in a cookie
 */
export function generateCsrfToken(): string {
  // Generate a random token
  const token = randomBytes(32).toString('hex');
  
  // Hash it to avoid storing the raw token in cookies
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  // Set the token in a cookie
  const cookieStore = cookies();
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: hashedToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: CSRF_TOKEN_EXPIRY / 1000, // seconds
  });
  
  // Return the unhashed token to be sent to the client
  return token;
}

/**
 * Verifies the CSRF token from a request
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  // Skip verification for non-state-changing methods
  if (!CSRF_METHODS.includes(request.method)) {
    return true;
  }
  
  // Get the token from the header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return false;
  }
  
  // Get the hashed token from the cookie
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return false;
  }
  
  // Hash the header token and compare with the cookie token
  const hashedHeaderToken = createHash('sha256').update(headerToken).digest('hex');
  return hashedHeaderToken === cookieToken;
}

/**
 * CSRF protection middleware for API routes
 */
export function csrfProtection(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Skip CSRF check for non-mutating methods
    if (!CSRF_METHODS.includes(req.method)) {
      return handler(req);
    }
    
    // Verify CSRF token
    if (!verifyCsrfToken(req)) {
      return NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 });
    }
    
    // Call the original handler
    return handler(req);
  };
}