import { Context, Next } from 'koa';
import { Logger } from '../shared/logger';

const logger = new Logger('ErrorHandler');

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error: any) {
    logger.error('Unhandled error', error, {
      requestId: ctx.state.requestId,
      method: ctx.method,
      url: ctx.url,
    });

    ctx.status = error.status || 500;
    ctx.body = {
      success: false,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
  }
}
