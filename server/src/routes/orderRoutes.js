import { Router } from 'express';
import {
  createCheckout,
  confirmPayment,
  handleWebhook,
  getCustomerOrders,
  getVendorSubOrders,
  updateSubOrderStatus,
  refundSubOrder
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public webhook with signature/idempotency verification
router.post('/payments/webhook', handleWebhook);

// Protected routes
router.use(requireAuth);

router.post('/checkout', createCheckout);
router.post('/confirm-payment', confirmPayment);
router.get('/customer', getCustomerOrders);
router.get('/vendor/sub-orders', requireRole('vendor', 'admin'), getVendorSubOrders);
router.put('/sub-orders/:id/status', requireRole('vendor', 'admin'), updateSubOrderStatus);
router.post('/sub-orders/:id/refund', requireRole('admin'), refundSubOrder);

export default router;
