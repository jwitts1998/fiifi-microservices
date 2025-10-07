import dotenv from 'dotenv';
import logger from '@/shared/logger';

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  // Server configuration
  port: number;
  nodeEnv: string;
  
  // Database configuration
  mongodbUri: string;
  
  // JWT configuration
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  
  // OAuth configuration
  googleClientId?: string;
  googleClientSecret?: string;
  linkedinClientId?: string;
  linkedinClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  twitterConsumerKey?: string;
  twitterConsumerSecret?: string;
  
  // AWS Cognito configuration
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  cognitoRegion?: string;
  
  // Logging configuration
  logLevel: string;
  
  // CORS configuration
  corsOrigin: string;
  
  // Rate limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

class EnvironmentValidator {
  private validateRequired(key: string, value: string | undefined): string {
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  private validateOptional(key: string, value: string | undefined): string | undefined {
    return value;
  }

  private validateNumber(key: string, value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Environment variable ${key} must be a valid number`);
    }
    return parsed;
  }

  public validate(): EnvironmentConfig {
    try {
      const config: EnvironmentConfig = {
        // Server configuration
        port: this.validateNumber('PORT', process.env.PORT, 3001),
        nodeEnv: this.validateRequired('NODE_ENV', process.env.NODE_ENV) || 'development',
        
        // Database configuration
        mongodbUri: this.validateRequired('MONGODB_URI', process.env.MONGODB_URI),
        
        // JWT configuration
        jwtAccessSecret: this.validateRequired('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET),
        jwtRefreshSecret: this.validateRequired('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
        jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
        
        // OAuth configuration (optional)
        googleClientId: this.validateOptional('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID),
        googleClientSecret: this.validateOptional('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET),
        linkedinClientId: this.validateOptional('LINKEDIN_CLIENT_ID', process.env.LINKEDIN_CLIENT_ID),
        linkedinClientSecret: this.validateOptional('LINKEDIN_CLIENT_SECRET', process.env.LINKEDIN_CLIENT_SECRET),
        facebookAppId: this.validateOptional('FACEBOOK_APP_ID', process.env.FACEBOOK_APP_ID),
        facebookAppSecret: this.validateOptional('FACEBOOK_APP_SECRET', process.env.FACEBOOK_APP_SECRET),
        twitterConsumerKey: this.validateOptional('TWITTER_CONSUMER_KEY', process.env.TWITTER_CONSUMER_KEY),
        twitterConsumerSecret: this.validateOptional('TWITTER_CONSUMER_SECRET', process.env.TWITTER_CONSUMER_SECRET),
        
        // AWS Cognito configuration (optional)
        cognitoUserPoolId: this.validateOptional('COGNITO_USER_POOL_ID', process.env.COGNITO_USER_POOL_ID),
        cognitoClientId: this.validateOptional('COGNITO_CLIENT_ID', process.env.COGNITO_CLIENT_ID),
        cognitoRegion: this.validateOptional('COGNITO_REGION', process.env.COGNITO_REGION),
        
        // Logging configuration
        logLevel: process.env.LOG_LEVEL || 'info',
        
        // CORS configuration
        corsOrigin: process.env.CORS_ORIGIN || '*',
        
        // Rate limiting
        rateLimitWindowMs: this.validateNumber('RATE_LIMIT_WINDOW_MS', process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
        rateLimitMaxRequests: this.validateNumber('RATE_LIMIT_MAX_REQUESTS', process.env.RATE_LIMIT_MAX_REQUESTS, 100)
      };

      logger.info('Environment configuration validated successfully', {
        nodeEnv: config.nodeEnv,
        port: config.port,
        logLevel: config.logLevel,
        hasOAuth: !!(config.googleClientId || config.linkedinClientId || config.facebookAppId || config.twitterConsumerKey),
        hasCognito: !!(config.cognitoUserPoolId && config.cognitoClientId)
      });

      return config;
    } catch (error) {
      logger.error('Environment validation failed', error as Error);
      throw error;
    }
  }
}

export const environmentConfig = new EnvironmentValidator().validate();
