import { Context, Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../shared/logger';

const logger = new Logger('RequestLogger');

export async function requestLogger(ctx: Context, next: Next) {
  const requestId = uuidv4();
  ctx.state.requestId = requestId;
  
  const start = Date.now();
  
  logger.info('Incoming request', {
    requestId,
    method: ctx.method,
    url: ctx.url,
    userAgent: ctx.headers['user-agent'],
    ip: ctx.ip,
  });

  await next();

  const duration = Date.now() - start;
  
  logger.info('Request completed', {
    requestId,
    method: ctx.method,
    url: ctx.url,
    status: ctx.status,
    duration: `${duration}ms`,
  });
}
