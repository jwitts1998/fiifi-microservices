import mongoose from 'mongoose';
import { Logger } from '../shared/logger';

const logger = new Logger('Database');

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fiifi';
    
    logger.info('Connecting to MongoDB', { uri: mongoUri });
    
    await mongoose.connect(mongoUri);
    
    logger.info('Successfully connected to MongoDB');
  } catch (error: any) {
    logger.error('Failed to connect to MongoDB', error);
    throw error;
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
