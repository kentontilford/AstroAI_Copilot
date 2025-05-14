import { AppError } from './error-types';

// Define log levels
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

// Get log level from environment or default to ERROR in production and DEBUG otherwise
const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG);

/**
 * Check if the given level should be logged based on the current LOG_LEVEL
 */
function shouldLog(level: LogLevel): boolean {
  const levels = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };

  return levels[level] >= levels[LOG_LEVEL as LogLevel];
}

/**
 * Format the error message with additional context
 */
function formatErrorMessage(error: unknown): { message: string; data: Record<string, unknown> } {
  if (error instanceof AppError) {
    return {
      message: `[${error.code}] ${error.message}`,
      data: {
        name: error.name,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: error.stack,
        isOperational: error.isOperational,
      },
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      data: {
        name: error.name,
        stack: error.stack,
      },
    };
  }

  return {
    message: 'Unknown error',
    data: { error },
  };
}

/**
 * Log an error with appropriate context
 */
export function errorLogger(error: unknown, context?: Record<string, unknown>): void {
  if (!shouldLog(LogLevel.ERROR)) return;

  const { message, data } = formatErrorMessage(error);
  
  // Add request context if available
  const logData = {
    ...data,
    ...(context && { context }),
    timestamp: new Date().toISOString(),
  };

  // In a production environment, you might want to integrate with a logging service
  // like Winston, Pino, or a cloud logging provider
  if (process.env.NODE_ENV === 'production') {
    // Here you could integrate with an external logging service
    console.error(message, logData);
  } else {
    console.error(message, logData);
  }
}

/**
 * Log information at the specified level
 */
export function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const logData = {
    ...(data || {}),
    timestamp: new Date().toISOString(),
  };

  switch (level) {
    case LogLevel.DEBUG:
      console.debug(message, logData);
      break;
    case LogLevel.INFO:
      console.info(message, logData);
      break;
    case LogLevel.WARN:
      console.warn(message, logData);
      break;
    case LogLevel.ERROR:
      console.error(message, logData);
      break;
  }
}