import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// NFR-06: File filter and size limit (max 5MB, images/pdf only)
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file format. Allowed: jpeg, png, webp, pdf', 400, 'INVALID_FILE_TYPE'));
    }
  }
});

router.post('/', requireAuth, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'VALIDATION_ERROR');
    }

    // shortcut: return base64 data URI in dev mode, upgrade to Cloudinary uploader with production API keys
    const base64 = req.file.buffer.toString('base64');
    const url = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      success: true,
      data: {
        url,
        fileName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
