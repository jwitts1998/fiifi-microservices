import Router from 'koa-router';
import { CleanupController } from '../controllers/CleanupController';

const router = new Router();
const cleanupController = new CleanupController();

// Cleanup routes
router.get('/cleanup/stats', cleanupController.getDatabaseStats.bind(cleanupController));
router.post('/cleanup/old-data', cleanupController.cleanupOldData.bind(cleanupController));
router.post('/cleanup/collection', cleanupController.deleteCollection.bind(cleanupController));

export default router;
