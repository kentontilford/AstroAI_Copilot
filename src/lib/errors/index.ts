import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AppError, HttpError, ValidationError, DatabaseError, AuthError, ResourceNotFoundError } from './error-types';
import { errorHandler } from './handlers';
import { errorLogger } from './logger';

export {
  AppError,
  HttpError,
  ValidationError,
  DatabaseError,
  AuthError,
  ResourceNotFoundError,
  errorHandler,
  errorLogger
};

/**
 * A handler that wraps API route handlers with consistent error handling
 */
export function withErrorHandling<T>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorHandler(error);
    }
  };
}

/**
 * Format an error into a consistent API response format
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code?: string;
  details?: unknown;
  status: number;
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      status: error.statusCode,
    };
  }

  if (error instanceof ZodError) {
    return {
      error: 'Validation error',
      code: 'validation_error',
      details: error.format(),
      status: 400,
    };
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  return {
    error: 'An unexpected error occurred',
    code: 'internal_server_error',
    status: 500,
  };
}