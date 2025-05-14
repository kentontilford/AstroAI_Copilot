/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'app_error',
    statusCode: number = 500,
    details?: unknown,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // This is needed for proper inheritance in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error class for HTTP-related errors
 */
export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'http_error',
    details?: unknown
  ) {
    super(message, code, statusCode, details);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'validation_error', 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error class for database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'database_error', 500, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Error class for authentication and authorization errors
 */
export class AuthError extends AppError {
  constructor(message: string, code: string = 'auth_error', details?: unknown) {
    super(message, code, 401, details);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Error class for resource not found errors
 */
export class ResourceNotFoundError extends AppError {
  constructor(resource: string, details?: unknown) {
    super(`${resource} not found`, 'not_found', 404, details);
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}

/**
 * Error class for subscription-related errors
 */
export class SubscriptionError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'subscription_required', 402, details);
    Object.setPrototypeOf(this, SubscriptionError.prototype);
  }
}

/**
 * Error class for rate limiting errors
 */
export class RateLimitError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'rate_limit_exceeded', 429, details);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error class for astrology calculation errors
 */
export class AstrologyCalculationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'astrology_calculation_error', 500, details);
    Object.setPrototypeOf(this, AstrologyCalculationError.prototype);
  }
}

/**
 * Error class for OpenAI API errors
 */
export class OpenAIError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'openai_error', 500, details);
    Object.setPrototypeOf(this, OpenAIError.prototype);
  }
}