import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getWishlist,
  toggleWishlist,
  flagItem,
  getModerationQueue,
  resolveModeration
} from '../controllers/engagementController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public review reading
router.get('/reviews/:productId', getProductReviews);

// Protected engagement routes
router.use(requireAuth);

router.post('/reviews', createReview);
router.get('/wishlist', getWishlist);
router.post('/wishlist/toggle', toggleWishlist);
router.post('/flag', flagItem);

// Admin moderation
router.get('/admin/moderation', requireRole('admin'), getModerationQueue);
router.put('/admin/moderation/:id', requireRole('admin'), resolveModeration);

export default router;
