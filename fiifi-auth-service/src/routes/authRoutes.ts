import Router from 'koa-router';
import { authController } from '@/controllers/AuthController';

const router = new Router({
  prefix: '/auth'
});

// Public routes (no authentication required)
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.get('/health', authController.healthCheck.bind(authController));

// Protected routes (authentication required)
router.post('/logout', authController.logout.bind(authController));
router.post('/logout-all', authController.logoutAll.bind(authController));
router.get('/profile', authController.getProfile.bind(authController));

export default router;
