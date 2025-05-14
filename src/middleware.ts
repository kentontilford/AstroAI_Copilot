import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { securityHeaders } from '@/lib/config/security';
import { AuditEventType } from "@/lib/auth/audit";
 
// List of public routes (accessible without authentication)
const publicRoutes = [
  "/",                  // Home page
  "/log-in*",           // Sign in page and its sub-routes
  "/sign-up*",          // Sign up page and its sub-routes
  "/pricing",           // Pricing page
  "/api/health",        // Health check endpoint
  "/api/webhook*",      // Webhook endpoints
  "/api/clerk/webhook*", // Clerk webhook endpoint
  "/api/stripe/webhook*", // Stripe webhook endpoint
  "/payment-success*",   // Payment success page
];

// List of routes that require admin access
const adminRoutes = [
  "/admin*",            // Admin dashboard and its sub-routes
  "/api/admin*",        // Admin API endpoints
];

// List of routes that require specific permissions or subscriptions
const protectedFeatureRoutes = [
  "/dashboard*",        // Dashboard pages require subscription
  "/api/dashboard*",    // Dashboard API endpoints
  "/api/astrology*",    // Astrology calculation endpoints
];

/**
 * Apply security headers to all responses
 */
function applySecurityHeaders(response: NextResponse) {
  // Apply security headers to the response
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export default authMiddleware({
  publicRoutes,
  
  // Middleware that runs before authentication
  beforeAuth: (req) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      return applySecurityHeaders(response);
    }
    
    // Continue with request
    return NextResponse.next();
  },
  
  // Middleware that runs after authentication
  afterAuth: async (auth, req) => {
    // Get the response from the auth middleware
    let response: NextResponse;
    
    // If the user is authenticated and trying to access a sign-in or sign-up page,
    // redirect them to the dashboard
    if (auth.userId && (req.url.includes('/log-in') || req.url.includes('/sign-up'))) {
      response = NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // If the user is not authenticated and trying to access a protected route,
    // redirect to sign in
    else if (!auth.userId && !isPublicRoute(req.url)) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Check for admin routes access
    else if (auth.userId && isAdminRoute(req.url)) {
      // Check if user is admin
      // In a real implementation, you would query the database or check claims
      // For now, we'll assume the user is not an admin and redirect
      response = NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Allow the request to proceed
    else {
      response = NextResponse.next();
    }
    
    // Apply security headers to all responses
    return applySecurityHeaders(response);
  },
});

// Helper function to check if a URL is a public route
function isPublicRoute(url: string): boolean {
  return publicRoutes.some(route => {
    // Convert route pattern to regex
    if (route.endsWith('*')) {
      // Remove the * and escape special regex chars
      const baseRoute = route.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${baseRoute}`).test(url);
    }
    return url.includes(route);
  });
}

// Helper function to check if a URL is an admin route
function isAdminRoute(url: string): boolean {
  return adminRoutes.some(route => {
    // Convert route pattern to regex
    if (route.endsWith('*')) {
      // Remove the * and escape special regex chars
      const baseRoute = route.slice(0, -1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${baseRoute}`).test(url);
    }
    return url.includes(route);
  });
}

// Specify the paths that don't require authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)',
    "/", 
    "/(api|trpc)(.*)"
  ],
};