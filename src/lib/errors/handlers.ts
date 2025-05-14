import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { 
  AppError, 
  ValidationError, 
  DatabaseError, 
  ResourceNotFoundError,
  AuthError 
} from './error-types';
import { errorLogger } from './logger';

/**
 * Central error handler that converts different error types to appropriate HTTP responses
 */
export function errorHandler(error: unknown): NextResponse {
  // Log the error
  errorLogger(error);

  // First check for our own AppError types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        code: 'validation_error',
        details: error.format(),
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Database validation error',
        code: 'database_validation_error',
      },
      { status: 400 }
    );
  }

  // Handle specific built-in error types
  if (error instanceof URIError || error instanceof SyntaxError || error instanceof TypeError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.name.toLowerCase(),
      },
      { status: 400 }
    );
  }

  // For unknown errors, return a generic server error
  console.error('Unexpected error:', error);
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'internal_server_error',
    },
    { status: 500 }
  );
}

/**
 * Handle specific Prisma error types with appropriate responses
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      return NextResponse.json(
        {
          error: 'A record with this data already exists',
          code: 'unique_constraint_violation',
          fields: error.meta?.target,
        },
        { status: 409 }
      );

    case 'P2025': // Record not found
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'not_found',
        },
        { status: 404 }
      );

    case 'P2003': // Foreign key constraint failed
      return NextResponse.json(
        {
          error: 'Related record not found',
          code: 'foreign_key_constraint',
          fields: error.meta?.field_name,
        },
        { status: 400 }
      );

    default:
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'database_error',
          prismaCode: error.code,
        },
        { status: 500 }
      );
  }
}

/**
 * Convert unknown errors to AppError instances
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError('Validation error', error.format());
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return new ResourceNotFoundError('Record', error);
    }
    return new DatabaseError(`Prisma error: ${error.code}`, error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Database validation error', error);
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'unknown_error', 500, error);
  }

  return new AppError('An unknown error occurred', 'unknown_error', 500, error);
}