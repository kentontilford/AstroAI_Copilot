# Error Handling System Documentation

This document outlines the error handling system implemented in the Astrology AI Copilot application. The system provides a consistent approach to handling, logging, and displaying errors throughout the application.

## Core Principles

1. **Consistency** - All errors are handled in a consistent manner
2. **Type Safety** - Custom error types with appropriate status codes and error codes
3. **Informative Responses** - Error responses provide meaningful information to API consumers
4. **Centralized Handling** - Error handling logic is centralized in utility functions
5. **Operational/Programmer Distinction** - Errors are categorized as operational (expected) or programmer (unexpected)
6. **Detailed Logging** - Error logging provides context for debugging

## Error Types

The application defines a hierarchy of error types to represent different categories of errors:

```
AppError (base class)
├── HttpError
├── ValidationError
├── DatabaseError
├── AuthError
├── ResourceNotFoundError
├── SubscriptionError
├── RateLimitError
├── AstrologyCalculationError
└── OpenAIError
```

Each error type includes:
- A descriptive message
- An error code string (e.g., `"validation_error"`)
- An HTTP status code
- Optional details for debugging
- A flag indicating if the error is operational

## Server-Side Error Handling

### API Routes

API routes use the `withErrorHandling` higher-order function to wrap route handlers:

```typescript
export const GET = secureHandler(
  withErrorHandling(async (req: NextRequest) => {
    // Route handler implementation
  }),
  {
    // Security options
  }
);
```

Inside route handlers, appropriate error types are thrown based on the error condition:

```typescript
if (!userId) {
  throw new AuthError("Unauthorized");
}

if (!data) {
  throw new ValidationError("Invalid input", validationDetails);
}
```

The `errorHandler` function in `handlers.ts` converts these errors to consistent HTTP responses with appropriate status codes and JSON bodies.

### Error Conversion

The system handles automatic conversion of common error types:

- Zod validation errors → ValidationError
- Prisma database errors → DatabaseError or ResourceNotFoundError
- Standard JS errors → AppError

### Error Logging

Errors are logged with context through the `errorLogger` function, which formats errors with additional information such as stack traces, error codes, and request context.

## Client-Side Error Handling

### API Response Handling

The client includes utilities for handling API responses:

```typescript
const data = await handleApiResponse<ResponseType>(response);
```

If the response is not successful, `handleApiError` extracts error information from the response and throws an appropriate error.

### Error Display

The `showErrorToast` function displays user-friendly error messages based on the error type, using the toast component for notifications.

```typescript
try {
  // API call
} catch (error) {
  handleApiError(error);
}
```

### Error Boundaries

React error boundaries are implemented to catch and display render errors:

1. **Global Error Boundary** - The `error.tsx` file provides app-wide error handling
2. **Component Error Boundaries** - The `ErrorBoundary` component can wrap individual components to contain errors

## Next.js Integration

The system integrates with Next.js error handling:

1. `error.tsx` - Global error page for server component errors
2. `not-found.tsx` - Custom 404 page for missing resources
3. Error boundaries for client components

## Best Practices

1. **Always throw typed errors** - Use the appropriate error type for each error condition
2. **Include detailed error messages** - Error messages should be descriptive and helpful
3. **Add context details** - Include relevant details for debugging
4. **Use client utilities** - Always handle API responses with `handleApiResponse`
5. **Wrap components** - Use error boundaries to prevent UI crashes
6. **Log appropriately** - Log errors with context for debugging

## Example Usage

### Server-Side

```typescript
// API route with error handling
export const GET = withErrorHandling(
  async (req: NextRequest) => {
    // Get user from auth
    const { userId } = auth();
    if (!userId) {
      throw new AuthError("Unauthorized");
    }
    
    // Get data from database
    const data = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    }).catch(error => {
      throw new DatabaseError("Failed to fetch user", error);
    });
    
    if (!data) {
      throw new ResourceNotFoundError("User");
    }
    
    return NextResponse.json(data);
  }
);
```

### Client-Side

```typescript
// Component with error handling
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await handleApiResponse<DataType>(response);
    setData(data);
  } catch (error) {
    handleApiError(error);
    setError('Failed to load data');
  }
};
```

## Files Structure

```
src/lib/errors/
├── index.ts         - Main exports
├── error-types.ts   - Custom error classes
├── handlers.ts      - Error handling utilities
├── logger.ts        - Error logging utilities
└── client.ts        - Client-side error utilities

src/app/
├── error.tsx        - Global error page
└── not-found.tsx    - 404 page

src/components/
└── ErrorBoundary.tsx - Component error boundary
```