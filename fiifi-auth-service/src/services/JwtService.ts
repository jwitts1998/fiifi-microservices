import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';
import logger from '@/shared/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class JwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env['JWT_ACCESS_SECRET'] || 'your-access-secret';
    this.refreshTokenSecret = process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret';
    this.accessTokenExpiry = process.env['JWT_ACCESS_EXPIRY'] || '15m';
    this.refreshTokenExpiry = process.env['JWT_REFRESH_EXPIRY'] || '7d';
  }

  generateTokenPair(user: IUser, sessionId: string): TokenPair {
    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      sessionId
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    } as any);

    const refreshToken = jwt.sign(
      { sessionId, userId: user._id },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry
      } as any
    );

    logger.info('Token pair generated', {
      userId: user._id,
      sessionId,
      tokenType: 'access_refresh_pair'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.accessTokenExpiry)
    };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      logger.debug('Access token verified', {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      });
      return decoded;
    } catch (error) {
      logger.warn('Access token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenType: 'access'
      });
      return null;
    }
  }

  verifyRefreshToken(token: string): { sessionId: string; userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as { sessionId: string; userId: string };
      logger.debug('Refresh token verified', {
        sessionId: decoded.sessionId,
        userId: decoded.userId
      });
      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenType: 'refresh'
      });
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string, user: IUser): Promise<TokenPair | null> {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      sessionId: decoded.sessionId
    };

    const newAccessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry
    } as any);

    logger.info('Access token refreshed', {
      userId: user._id,
      sessionId: decoded.sessionId
    });

    return {
      accessToken: newAccessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.accessTokenExpiry)
    };
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

    const value = parseInt(match[1] || '15', 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }
}

export const jwtService = new JwtService();
