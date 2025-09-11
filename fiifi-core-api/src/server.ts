import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import serve from 'koa-static';
import path from 'path';
import { connectDatabase } from './config/database';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { cors as customCors } from './middleware/cors';
import companyRoutes from './routes/companyRoutes';
import { Logger } from './shared/logger';

const logger = new Logger('Server');

export function createApp(): Koa {
  const app = new Koa();

  // Middleware
  app.use(errorHandler);
  app.use(requestLogger);
  app.use(cors());
  app.use(customCors);
  app.use(bodyParser());

  // Serve static files from public directory
  app.use(serve(path.join(__dirname, '../public')));

  // Routes
  app.use(companyRoutes.routes());
  app.use(companyRoutes.allowedMethods());

  // Health check endpoint
  app.use(async (ctx, next) => {
    if (ctx.path === '/health') {
      ctx.status = 200;
      ctx.body = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
      return;
    }
    await next();
  });

  return app;
}

export async function startServer(port: number = 3000): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    
    const app = createApp();
    
    app.listen(port, () => {
      logger.info(`Server started on port ${port}`, {
        port,
        environment: process.env.NODE_ENV || 'development',
      });
      logger.info(`Web dashboard available at: http://localhost:${port}`, {
        dashboard: `http://localhost:${port}`,
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}
