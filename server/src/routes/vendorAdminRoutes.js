import { Router } from 'express';
import {
  getVendors,
  updateVendorStatus,
  applyVendorKYC
} from '../controllers/vendorAdminController.js';
import {
  getCommissionRate,
  updateCommissionRate,
  getPayoutLedger,
  settlePayout,
  getAuditLogs
} from '../controllers/adminFinanceController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// Vendor application/KYC
router.post('/kyc/apply', requireRole('vendor'), applyVendorKYC);

// Admin vendor approval & management
router.get('/admin/vendors', requireRole('admin'), getVendors);
router.put('/admin/vendors/:id/status', requireRole('admin'), updateVendorStatus);

// Finance & platform settings
router.get('/finance/commission', getCommissionRate);
router.put('/finance/commission', requireRole('admin'), updateCommissionRate);
router.get('/finance/ledger', requireRole('admin', 'vendor'), getPayoutLedger);
router.put('/finance/ledger/:id/settle', requireRole('admin'), settlePayout);
router.get('/admin/audit-logs', requireRole('admin'), getAuditLogs);

export default router;
