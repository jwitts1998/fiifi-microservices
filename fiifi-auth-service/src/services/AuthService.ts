import { User, IUser } from '@/models/User';
import { Session, ISession } from '@/models/Session';
import { jwtService, TokenPair } from './JwtService';
import logger from '@/shared/logger';
import { v4 as uuidv4 } from 'uuid';

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    deviceType: string;
    browser?: string;
    os?: string;
  };
}

export interface OAuthProfile {
  provider: 'google' | 'linkedin' | 'facebook' | 'twitter';
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface AuthResult {
  success: boolean;
  user?: IUser;
  tokens?: TokenPair;
  message?: string;
  requiresEmailVerification?: boolean;
  requiresPasswordReset?: boolean;
}

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password, deviceInfo } = credentials;

      logger.info('User authentication attempt', {
        email,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent
      });

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        logger.warn('Authentication failed: user not found', { email });
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if account is locked
      if (user.isLocked()) {
        logger.warn('Authentication failed: account locked', {
          userId: user._id,
          email
        });
        return {
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts'
        };
      }

      // Check if account is active
      if (!user.isActive) {
        logger.warn('Authentication failed: account inactive', {
          userId: user._id,
          email
        });
        return {
          success: false,
          message: 'Account is inactive. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        logger.warn('Authentication failed: invalid password', {
          userId: user._id,
          email
        });
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        logger.info('Authentication failed: email not verified', {
          userId: user._id,
          email
        });
        return {
          success: false,
          message: 'Please verify your email address before logging in',
          requiresEmailVerification: true
        };
      }

      // Reset login attempts and update last login
      await user.resetLoginAttempts();

      // Create session
      const sessionId = uuidv4();
      const tokens = jwtService.generateTokenPair(user, sessionId);

      const session = new Session({
        _id: sessionId,
        userId: user._id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();

      logger.info('User authenticated successfully', {
        userId: user._id,
        email,
        sessionId
      });

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      logger.error('Authentication error', error as Error, { email: credentials.email });
      return {
        success: false,
        message: 'An error occurred during authentication'
      };
    }
  }

  /**
   * Authenticate user with OAuth provider
   */
  async authenticateOAuthUser(profile: OAuthProfile, deviceInfo: any): Promise<AuthResult> {
    try {
      logger.info('OAuth authentication attempt', {
        provider: profile.provider,
        email: profile.email,
        providerId: profile.providerId
      });

      // Find user by OAuth provider ID
      const oauthField = `oauthProviders.${profile.provider}`;
      let user = await User.findOne({ [oauthField]: profile.providerId });

      if (!user) {
        // Check if user exists with same email
        user = await User.findOne({ email: profile.email.toLowerCase() });
        
        if (user) {
          // Link OAuth provider to existing account
          user.oauthProviders[profile.provider] = profile.providerId;
          await user.save();
        } else {
          // Create new user
          user = new User({
            email: profile.email.toLowerCase(),
            username: profile.email.split('@')[0] + '_' + profile.provider,
            firstName: profile.firstName,
            lastName: profile.lastName,
            isEmailVerified: true, // OAuth emails are pre-verified
            oauthProviders: {
              [profile.provider]: profile.providerId
            }
          });

          await user.save();
        }
      }

      // Check if account is active
      if (!user.isActive) {
        logger.warn('OAuth authentication failed: account inactive', {
          userId: user._id,
          provider: profile.provider
        });
        return {
          success: false,
          message: 'Account is inactive. Please contact support.'
        };
      }

      // Create session
      const sessionId = uuidv4();
      const tokens = jwtService.generateTokenPair(user, sessionId);

      const session = new Session({
        _id: sessionId,
        userId: user._id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();

      logger.info('OAuth user authenticated successfully', {
        userId: user._id,
        provider: profile.provider,
        sessionId
      });

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      logger.error('OAuth authentication error', error as Error, {
        provider: profile.provider,
        email: profile.email
      });
      return {
        success: false,
        message: 'An error occurred during OAuth authentication'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Find session
      const session = await Session.findOne({
        refreshToken,
        isActive: true
      });

      if (!session) {
        return {
          success: false,
          message: 'Session not found or expired'
        };
      }

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive'
        };
      }

      // Generate new tokens
      const tokens = await jwtService.refreshAccessToken(refreshToken, user);

      if (!tokens) {
        return {
          success: false,
          message: 'Failed to refresh token'
        };
      }

      // Update session
      session.token = tokens.accessToken;
      session.lastAccessedAt = new Date();
      await session.save();

      logger.info('Token refreshed successfully', {
        userId: user._id,
        sessionId: decoded.sessionId
      });

      return {
        success: true,
        user,
        tokens
      };

    } catch (error) {
      logger.error('Token refresh error', error as Error);
      return {
        success: false,
        message: 'An error occurred during token refresh'
      };
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logoutUser(token: string): Promise<boolean> {
    try {
      const decoded = jwtService.verifyAccessToken(token);
      if (!decoded) {
        return false;
      }

      await Session.updateOne(
        { token, isActive: true },
        { isActive: false }
      );

      logger.info('User logged out', {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      });

      return true;
    } catch (error) {
      logger.error('Logout error', error as Error);
      return false;
    }
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAllSessions(userId: string): Promise<boolean> {
    try {
      await Session.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );

      logger.info('All sessions logged out', { userId });
      return true;
    } catch (error) {
      logger.error('Logout all sessions error', error as Error, { userId });
      return false;
    }
  }
}

export const authService = new AuthService();
