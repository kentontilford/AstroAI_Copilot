import { errorHandler, normalizeError } from './handlers';
import { NextResponse } from 'next/server';
import { AppError, ValidationError, DatabaseError, ResourceNotFoundError } from './error-types';
import { ZodError, z } from 'zod';
import { Prisma } from '@prisma/client';

// Mock errorLogger to avoid console logs in tests
jest.mock('./logger', () => ({
  errorLogger: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, options) => ({
      body,
      status: options?.status || 200,
    })),
  },
}));

describe('Error handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle AppError types', () => {
      const error = new AppError('Test app error', 'test_error', 418, { extra: 'details' });
      const response = errorHandler(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Test app error',
          code: 'test_error',
          details: { extra: 'details' },
        },
        { status: 418 }
      );
    });

    it('should handle ZodError', () => {
      const schema = z.object({
        name: z.string().min(3),
      });
      
      try {
        schema.parse({ name: 'ab' });
        fail('ZodError should have been thrown');
      } catch (error) {
        const response = errorHandler(error);
        
        expect(NextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation error',
            code: 'validation_error',
            details: expect.any(Object),
          }),
          { status: 400 }
        );
      }
    });

    it('should handle Prisma known request errors', () => {
      const error = new Error('Prisma error') as Prisma.PrismaClientKnownRequestError;
      error.code = 'P2002';
      error.meta = { target: ['email'] };
      Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype);
      
      const response = errorHandler(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'A record with this data already exists',
          code: 'unique_constraint_violation',
        }),
        { status: 409 }
      );
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const response = errorHandler(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: error.message,
          code: error.name.toLowerCase(),
        },
        { status: 400 }
      );
    });

    it('should return a generic server error for non-Error objects', () => {
      const error = 'Just a string';
      const response = errorHandler(error);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'An unexpected error occurred',
          code: 'internal_server_error',
        },
        { status: 500 }
      );
    });
  });

  describe('normalizeError', () => {
    it('should return AppError as is', () => {
      const originalError = new ValidationError('Test validation error');
      const normalized = normalizeError(originalError);
      
      expect(normalized).toBe(originalError);
    });

    it('should convert ZodError to ValidationError', () => {
      const schema = z.object({
        name: z.string().min(3),
      });
      
      try {
        schema.parse({ name: 'ab' });
        fail('ZodError should have been thrown');
      } catch (error) {
        const normalized = normalizeError(error);
        
        expect(normalized).toBeInstanceOf(ValidationError);
        expect(normalized.message).toBe('Validation error');
        expect(normalized.statusCode).toBe(400);
      }
    });

    it('should convert Prisma not found error to ResourceNotFoundError', () => {
      const error = new Error('Prisma error') as Prisma.PrismaClientKnownRequestError;
      error.code = 'P2025';
      Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype);
      
      const normalized = normalizeError(error);
      
      expect(normalized).toBeInstanceOf(ResourceNotFoundError);
      expect(normalized.statusCode).toBe(404);
    });

    it('should convert other Prisma errors to DatabaseError', () => {
      const error = new Error('Prisma error') as Prisma.PrismaClientKnownRequestError;
      error.code = 'P2003';
      Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype);
      
      const normalized = normalizeError(error);
      
      expect(normalized).toBeInstanceOf(DatabaseError);
      expect(normalized.statusCode).toBe(500);
    });

    it('should convert standard Error to AppError', () => {
      const error = new Error('Standard error');
      const normalized = normalizeError(error);
      
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.message).toBe('Standard error');
      expect(normalized.statusCode).toBe(500);
    });

    it('should handle non-Error objects', () => {
      const error = { custom: 'error object' };
      const normalized = normalizeError(error);
      
      expect(normalized).toBeInstanceOf(AppError);
      expect(normalized.message).toBe('An unknown error occurred');
      expect(normalized.details).toBe(error);
    });
  });
});