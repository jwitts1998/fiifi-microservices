import mongoose from 'mongoose';
import { Logger } from '../shared/logger';

const logger = new Logger('Database');

export async function connectDatabase(): Promise<void> {
  try {
    // Build MongoDB URI from environment variables and secrets
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const host = process.env.MONGODB_HOST || 'fiifi-dev.h3qwt.mongodb.net';
    const options = process.env.MONGODB_OPTIONS || 'retryWrites=true&w=majority&appName=fiifi-dev';
    
    if (!username || !password) {
      throw new Error('MongoDB credentials not found in environment variables');
    }
    
    const mongoUri = `mongodb+srv://${username}:${password}@${host}/?${options}`;
    
    logger.info('Connecting to MongoDB', { 
      uri: mongoUri.replace(password, '***'), // Hide password in logs
      host,
      username 
    });
    
    await mongoose.connect(mongoUri);
    
    logger.info('Successfully connected to MongoDB');
  } catch (error: any) {
    logger.warn('Failed to connect to MongoDB - running in mock mode', error);
    // Don't throw error - allow application to start without database
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error: any) {
    logger.error('Error disconnecting from MongoDB', error);
    throw error;
  }
}
