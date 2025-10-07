import { Context } from 'koa';
import mongoose from 'mongoose';
import { Logger } from '../shared/logger';

export class CleanupController {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('CleanupController');
  }

  async getDatabaseStats(ctx: Context) {
    try {
      this.logger.info('Getting database statistics', { 
        requestId: ctx.state.requestId
      });

      // Get all collections
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const collections = await db.listCollections().toArray();
      
      const stats = [];
      for (const collection of collections) {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        stats.push({
          name: collection.name,
          count: count,
          size: 0, // Simplified for now
          avgObjSize: 0,
          storageSize: 0
        });
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          collections: stats,
          totalSize: stats.reduce((sum, stat) => sum + stat.size, 0),
          totalDocuments: stats.reduce((sum, stat) => sum + stat.count, 0)
        },
        message: 'Database statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Error getting database statistics', error, {
        requestId: ctx.state.requestId
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve database statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async cleanupOldData(ctx: Context) {
    try {
      const { collection, daysOld = 30, limit = 100 } = ctx.request.body as any;
      
      if (!collection) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Collection name required',
          message: 'Please specify which collection to clean up',
          timestamp: new Date().toISOString(),
        };
        return;
      }

      this.logger.info('Starting data cleanup', { 
        requestId: ctx.state.requestId,
        collection,
        daysOld,
        limit
      });

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const targetCollection = db.collection(collection);
      
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Find old documents
      const oldDocs = await targetCollection.find({
        $or: [
          { createdAt: { $lt: cutoffDate } },
          { modified: { $lt: cutoffDate } },
          { updatedAt: { $lt: cutoffDate } }
        ]
      }).limit(limit).toArray();

      if (oldDocs.length === 0) {
        ctx.status = 200;
        ctx.body = {
          success: true,
          data: { deletedCount: 0 },
          message: 'No old documents found to delete',
          timestamp: new Date().toISOString(),
        };
        return;
      }

      // Delete old documents
      const deleteResult = await targetCollection.deleteMany({
        _id: { $in: oldDocs.map(doc => doc._id) }
      });

      this.logger.info('Data cleanup completed', { 
        requestId: ctx.state.requestId,
        collection,
        deletedCount: deleteResult.deletedCount
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: { 
          deletedCount: deleteResult.deletedCount,
          cutoffDate: cutoffDate.toISOString(),
          collection
        },
        message: `Successfully deleted ${deleteResult.deletedCount} old documents from ${collection}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Error during data cleanup', error, {
        requestId: ctx.state.requestId,
        body: ctx.request.body
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to clean up data',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async deleteCollection(ctx: Context) {
    try {
      const { collection, confirm } = ctx.request.body as any;
      
      if (!collection || confirm !== 'DELETE') {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: 'Collection name and confirmation required',
          message: 'Please specify collection name and set confirm="DELETE"',
          timestamp: new Date().toISOString(),
        };
        return;
      }

      this.logger.info('Deleting collection', { 
        requestId: ctx.state.requestId,
        collection
      });

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const targetCollection = db.collection(collection);
      
      // Get count before deletion
      const count = await targetCollection.countDocuments();
      
      // Drop the collection
      await targetCollection.drop();

      this.logger.info('Collection deleted', { 
        requestId: ctx.state.requestId,
        collection,
        deletedCount: count
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: { 
          deletedCount: count,
          collection
        },
        message: `Successfully deleted collection ${collection} with ${count} documents`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Error deleting collection', error, {
        requestId: ctx.state.requestId,
        body: ctx.request.body
      });
      
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete collection',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
