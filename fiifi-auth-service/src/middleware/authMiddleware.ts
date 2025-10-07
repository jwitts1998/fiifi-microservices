import { Context, Next } from 'koa';
import { jwtService } from '@/services/JwtService';
import { Session } from '@/models/Session';
import logger from '@/shared/logger';

export interface AuthenticatedContext extends Context {
  user: {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
  };
}

/**
 * Middleware to verify JWT token and attach user info to context
 */
export async function authenticateToken(ctx: Context, next: Next): Promise<void> {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'Access token required'
      };
      return;
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);
    if (!decoded) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'Invalid or expired token'
      };
      return;
    }

    // Check if session is still active
    const session = await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'Session expired or invalid'
      };
      return;
    }

    // Update last accessed time
    session.lastAccessedAt = new Date();
    await session.save();

    // Attach user info to context
    (ctx as AuthenticatedContext).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId
    };

    logger.debug('Token authenticated successfully', {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
      path: ctx.path
    });

    await next();
  } catch (error) {
    logger.error('Authentication middleware error', error as Error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Authentication error'
    };
  }
}

/**
 * Middleware to check user roles
 */
export function requireRole(roles: string[]) {
  return async (ctx: Context, next: Next): Promise<void> => {
    const authCtx = ctx as AuthenticatedContext;
    
    if (!authCtx.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'Authentication required'
      };
      return;
    }

    if (!roles.includes(authCtx.user.role)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: 'Insufficient permissions'
      };
      return;
    }

    await next();
  };
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is admin or investor
 */
export const requireAdminOrInvestor = requireRole(['admin', 'investor']);
