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
import cleanupRoutes from './routes/cleanupRoutes';
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

  // Health check endpoint (before static files)
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

  // API Routes (before static files)
  app.use(companyRoutes.routes());
  app.use(companyRoutes.allowedMethods());
  app.use(cleanupRoutes.routes());
  app.use(cleanupRoutes.allowedMethods());

  // Serve static files from public directory
  app.use(serve(path.join(__dirname, '../public')));

  // Root route handler - serve API info
  app.use(async (ctx, next) => {
    if (ctx.path === '/') {
      ctx.status = 200;
      ctx.body = {
        message: 'Fiifi Core API - Development Environment',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: '/health',
          companies: '/companies',
          dashboard: '/index.html',
          api_docs: '/api-docs'
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
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
      logger.info(`Web dashboard available at: http://localhost:${port}/index.html`, {
        dashboard: `http://localhost:${port}/index.html`,
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}
