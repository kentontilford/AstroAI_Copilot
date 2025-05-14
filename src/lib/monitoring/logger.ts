/**
 * Application logging configuration
 * Provides structured logging for production and development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * Logger class for consistent logging across the application
 */
class Logger {
  private isProduction: boolean;
  
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }
  
  /**
   * Log a debug message (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isProduction) return;
    this.log('debug', message, options);
  }
  
  /**
   * Log an info message
   */
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error, options?: LogOptions): void {
    const metadata = options?.metadata || {};
    
    if (error) {
      metadata.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }
    
    this.log('error', message, {
      ...options,
      metadata,
    });
  }
  
  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const timestamp = new Date().toISOString();
    const { context, userId, requestId, metadata } = options || {};
    
    // Create log entry
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || 'app',
      userId,
      requestId,
      environment: process.env.NODE_ENV,
      ...metadata,
    };
    
    // In production, log structured JSON
    if (this.isProduction) {
      console[level](JSON.stringify(logEntry));
    } 
    // In development, log formatted message
    else {
      const color = this.getColorForLevel(level);
      const reset = '\x1b[0m';
      
      // Format development log message
      const formattedContext = context ? `[${context}]` : '';
      const formattedUser = userId ? `[User: ${userId.substring(0, 8)}...]` : '';
      const formattedReq = requestId ? `[Req: ${requestId}]` : '';
      
      console[level](
        `${color}${timestamp} ${level.toUpperCase()} ${formattedContext}${formattedUser}${formattedReq}:${reset}`,
        message,
        metadata ? metadata : ''
      );
    }
  }
  
  /**
   * Get ANSI color code for log level
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case 'debug': return '\x1b[34m'; // Blue
      case 'info': return '\x1b[32m';  // Green
      case 'warn': return '\x1b[33m';  // Yellow
      case 'error': return '\x1b[31m'; // Red
      default: return '\x1b[0m';       // Reset
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

/**
 * HTTP middleware to log requests
 */
export function requestLogger(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to response headers
  res.headers.set('X-Request-ID', requestId);
  
  // Log request on completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = new URL(req.url).pathname;
    
    logger.info(`${method} ${url} ${statusCode} ${duration}ms`, {
      context: 'http',
      requestId,
      metadata: {
        method,
        url,
        statusCode,
        duration,
        userAgent: req.headers.get('user-agent'),
      },
    });
  });
  
  next();
}

/**
 * Get a logger for a specific context
 */
export function getContextLogger(context: string) {
  return {
    debug: (message: string, options?: Omit<LogOptions, 'context'>) => 
      logger.debug(message, { ...options, context }),
    info: (message: string, options?: Omit<LogOptions, 'context'>) => 
      logger.info(message, { ...options, context }),
    warn: (message: string, options?: Omit<LogOptions, 'context'>) => 
      logger.warn(message, { ...options, context }),
    error: (message: string, error?: Error, options?: Omit<LogOptions, 'context'>) => 
      logger.error(message, error, { ...options, context }),
  };
}