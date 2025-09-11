import winston from 'winston';
import { LogLevel, LogContext } from '../types';

// Log format configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, userId, requestId, correlationId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service,
      userId,
      requestId,
      correlationId,
      ...meta,
    });
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'fiifi-shared' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }));
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
  }));
}

// Logger utility functions
export class Logger {
  private service: string;
  private context: LogContext;

  constructor(service: string, context: LogContext = { service }) {
    this.service = service;
    this.context = context;
  }

  private log(level: LogLevel, message: string, meta: any = {}) {
    logger.log(level, message, {
      ...this.context,
      ...meta,
    });
  }

  error(message: string, error?: Error, meta: any = {}) {
    this.log('error', message, {
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  warn(message: string, meta: any = {}) {
    this.log('warn', message, meta);
  }

  info(message: string, meta: any = {}) {
    this.log('info', message, meta);
  }

  debug(message: string, meta: any = {}) {
    this.log('debug', message, meta);
  }

  // Set context for subsequent logs
  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
  }

  // Create child logger with additional context
  child(additionalContext: Partial<LogContext>) {
    return new Logger(this.service, { ...this.context, ...additionalContext });
  }
}

// Export default logger instance
export const defaultLogger = new Logger('fiifi-shared');
