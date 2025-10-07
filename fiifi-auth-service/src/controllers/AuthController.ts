import { Context } from 'koa';
import { authService, LoginCredentials, OAuthProfile } from '@/services/AuthService';
import { User } from '@/models/User';
import logger from '@/shared/logger';
import Joi from 'joi';

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

export class AuthController {
  /**
   * Login with email and password
   */
  async login(ctx: Context): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(ctx.request.body);
      if (error) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        };
        return;
      }

      const deviceInfo = {
        userAgent: ctx.headers['user-agent'] || 'Unknown',
        ipAddress: ctx.ip || ctx.request.ip || 'Unknown',
        deviceType: this.detectDeviceType(ctx.headers['user-agent'] || ''),
        browser: this.detectBrowser(ctx.headers['user-agent'] || ''),
        os: this.detectOS(ctx.headers['user-agent'] || '')
      };

      const credentials: LoginCredentials = {
        email: value.email,
        password: value.password,
        deviceInfo
      };

      const result = await authService.authenticateUser(credentials);

      if (!result.success) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: result.message,
          requiresEmailVerification: result.requiresEmailVerification,
          requiresPasswordReset: result.requiresPasswordReset
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens
      };

    } catch (error) {
      logger.error('Login controller error', error as Error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(ctx: Context): Promise<void> {
    try {
      const { error, value } = refreshTokenSchema.validate(ctx.request.body);
      if (error) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        };
        return;
      }

      const result = await authService.refreshToken(value.refreshToken);

      if (!result.success) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: result.message
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Token refreshed successfully',
        tokens: result.tokens
      };

    } catch (error) {
      logger.error('Refresh token controller error', error as Error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(ctx: Context): Promise<void> {
    try {
      const token = ctx.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Authorization token required'
        };
        return;
      }

      const success = await authService.logoutUser(token);

      if (!success) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Invalid token'
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      logger.error('Logout controller error', error as Error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Logout all sessions
   */
  async logoutAll(ctx: Context): Promise<void> {
    try {
      const token = ctx.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Authorization token required'
        };
        return;
      }

      // Get user ID from token
      const { jwtService } = await import('@/services/JwtService');
      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: 'Invalid token'
        };
        return;
      }

      const success = await authService.logoutAllSessions(decoded.userId);

      if (!success) {
        ctx.status = 500;
        ctx.body = {
          success: false,
          message: 'Failed to logout all sessions'
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'All sessions logged out successfully'
      };

    } catch (error) {
      logger.error('Logout all controller error', error as Error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(ctx: Context): Promise<void> {
    try {
      const token = ctx.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: 'Authorization token required'
        };
        return;
      }

      const { jwtService } = await import('@/services/JwtService');
      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: 'Invalid token'
        };
        return;
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'User not found'
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        user
      };

    } catch (error) {
      logger.error('Get profile controller error', error as Error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(ctx: Context): Promise<void> {
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Authentication service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  // Helper methods for device detection
  private detectDeviceType(userAgent: string): string {
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    if (/iPad|Android.*Tablet|Kindle|Silk/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
}

export const authController = new AuthController();
