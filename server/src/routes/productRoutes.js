import { Router } from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductSuggestions,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUploadCSV,
  getLowStockAlerts,
  getVendorProducts
} from '../controllers/productController.js';
import { requireAuth, requireRole, requireApprovedVendor } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB cap
const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/suggest', rateLimit({ windowMs: 60 * 1000, max: 120 }), getProductSuggestions);
router.get('/:id', getProductById);

// Vendor product routes
router.post('/', requireAuth, requireRole('vendor'), requireApprovedVendor, createProduct);
router.put('/:id', requireAuth, requireRole('vendor', 'admin'), updateProduct);
router.delete('/:id', requireAuth, requireRole('vendor', 'admin'), deleteProduct);
router.post('/bulk-csv', requireAuth, requireRole('vendor'), requireApprovedVendor, upload.single('file'), bulkUploadCSV);
router.get('/vendor/mine', requireAuth, requireRole('vendor'), getVendorProducts);
router.get('/vendor/low-stock', requireAuth, requireRole('vendor'), getLowStockAlerts);

export default router;
