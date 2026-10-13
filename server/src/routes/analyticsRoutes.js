import { Router } from 'express';
import { getVendorAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/vendor', requireRole('vendor'), getVendorAnalytics);
router.get('/admin', requireRole('admin'), getAdminAnalytics);

export default router;
