import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import logger from 'koa-logger';
import { databaseConfig } from '@/config/database';
import { environmentConfig } from '@/config/environment';
import authRoutes from '@/routes/authRoutes';
import { authenticateToken } from '@/middleware/authMiddleware';
import winstonLogger from '@/shared/logger';

class AuthServiceApp {
  private app: Koa;
  private server: any;

  constructor() {
    this.app = new Koa();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Request logging
    this.app.use(logger());

    // CORS
    this.app.use(cors({
      origin: environmentConfig.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing
    this.app.use(bodyParser({
      jsonLimit: '10mb',
      formLimit: '10mb',
      textLimit: '10mb'
    }));

    // Request ID middleware
    this.app.use(async (ctx, next) => {
      const requestId = ctx.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      ctx.set('X-Request-ID', requestId);
      
      // Add request ID to logger context
      winstonLogger.defaultMeta = { ...winstonLogger.defaultMeta, requestId };
      
      await next();
    });

    // Response time middleware
    this.app.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);
      
      winstonLogger.info('Request completed', {
        method: ctx.method,
        url: ctx.url,
        status: ctx.status,
        responseTime: ms,
        userAgent: ctx.headers['user-agent'],
        ip: ctx.ip
      });
    });
  }

  private setupRoutes(): void {
    // Health check route (before auth middleware)
    this.app.use(async (ctx, next) => {
      if (ctx.path === '/health') {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: 'Authentication service is healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: environmentConfig.nodeEnv,
          version: '1.0.0'
        };
        return;
      }
      await next();
    });

    // API routes
    this.app.use(authRoutes.routes());
    this.app.use(authRoutes.allowedMethods());

    // Root route
    this.app.use(async (ctx, next) => {
      if (ctx.path === '/') {
        ctx.status = 200;
        ctx.body = {
          success: true,
          message: 'Fiifi Authentication Service',
          version: '1.0.0',
          environment: environmentConfig.nodeEnv,
          endpoints: {
            health: '/health',
            login: '/auth/login',
            refresh: '/auth/refresh',
            logout: '/auth/logout',
            profile: '/auth/profile',
            logoutAll: '/auth/logout-all'
          },
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        };
        return;
      }
      await next();
    });

    // 404 handler
    this.app.use(async (ctx) => {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'Endpoint not found',
        path: ctx.path,
        method: ctx.method
      };
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.on('error', (error, ctx) => {
      winstonLogger.error('Application error', error, {
        method: ctx.method,
        url: ctx.url,
        status: ctx.status,
        userAgent: ctx.headers['user-agent'],
        ip: ctx.ip
      });
    });

    // Unhandled promise rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      winstonLogger.error('Unhandled promise rejection', new Error(reason as string), {
        promise: promise.toString()
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      winstonLogger.error('Uncaught exception', error);
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await databaseConfig.connect();

      // Start server
      this.server = this.app.listen(environmentConfig.port, () => {
        winstonLogger.info('Authentication service started', {
          port: environmentConfig.port,
          environment: environmentConfig.nodeEnv,
          nodeVersion: process.version,
          pid: process.pid
        });
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.shutdown('SIGTERM'));
      process.on('SIGINT', () => this.shutdown('SIGINT'));

    } catch (error) {
      winstonLogger.error('Failed to start authentication service', error as Error);
      process.exit(1);
    }
  }

  public async shutdown(signal: string): Promise<void> {
    winstonLogger.info(`Received ${signal}, shutting down gracefully`);

    try {
      // Close server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            winstonLogger.info('Server closed');
            resolve();
          });
        });
      }

      // Disconnect from database
      await databaseConfig.disconnect();

      winstonLogger.info('Authentication service shutdown complete');
      process.exit(0);
    } catch (error) {
      winstonLogger.error('Error during shutdown', error as Error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new AuthServiceApp();
app.start().catch((error) => {
  winstonLogger.error('Failed to start application', error);
  process.exit(1);
});

export default app;
