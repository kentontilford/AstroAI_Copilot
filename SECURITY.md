# Security Measures

This document outlines the security measures implemented in the Astrology AI Copilot application to protect user data and prevent various types of attacks.

## Authentication and Authorization

The application uses Clerk for authentication, which provides:

- Secure user authentication with multiple factors
- Protection against account takeover
- Session management
- JWT-based authentication

### Authorization Controls

- API routes check for authenticated users via Clerk's `auth()` middleware
- Resource access is validated against the authenticated user's ID
- Subscription status is verified before providing premium features

## Input Validation

All user input is validated using Zod schemas:

```typescript
export const birthDataSchema = z.object({
  profile_name: z.string()
    .min(1, "Profile name is required")
    .max(100, "Profile name must be less than 100 characters"),
  date_of_birth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  // ...other validations
});
```

### Validation Coverage

- API route parameters
- Request bodies
- Query parameters
- File uploads (when implemented)

## Rate Limiting

The application implements rate limiting for all API endpoints to prevent abuse:

```typescript
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
  
  // ...other configurations
};
```

## CSRF Protection

Cross-Site Request Forgery protection is implemented for all state-changing operations:

1. Token Generation: A secure token is generated and stored in an HTTP-only cookie
2. Token Validation: The token must be included in a custom header for all POST/PUT/DELETE requests
3. Double Submit Cookie Pattern: Helps prevent CSRF attacks even with XSS vulnerabilities

## Data Sanitization

User input is sanitized to prevent XSS attacks:

```typescript
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Replace special characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

## Sensitive Data Protection

- PII (Personally Identifiable Information) is carefully handled:
  - Birth dates and locations are protected
  - Restricted access to calculations and interpretations
  - Soft delete functionality preserves data for regulatory compliance

## Secure Headers

Recommended security headers are set:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## API Security

- HTTPS-only for all communication
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Authentication checks for all protected resources

## Database Security

- Parameterized queries using Prisma
- Strict type checking for database operations
- Sanitization of all user-provided input
- Indexes on frequently queried fields
- Constraints on sensitive data fields

## Secure Development Practices

- Dependencies are regularly updated
- Security patches are promptly applied
- Code is reviewed for security issues
- Authentication and authorization checks are thorough

## Further Reading

For more information on the security implementation details, see:

- [src/lib/security/csrf.ts](src/lib/security/csrf.ts) - CSRF protection implementation
- [src/lib/security/rate-limit.ts](src/lib/security/rate-limit.ts) - Rate limiting implementation
- [src/lib/validation/index.ts](src/lib/validation/index.ts) - Input validation schemas
- [src/lib/security/sanitize.ts](src/lib/security/sanitize.ts) - Input sanitization utilities