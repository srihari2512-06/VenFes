import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getVendors(req, res, next) {
  try {
    const { status } = req.query;
    const query = { role: 'vendor' };
    if (status) {
      query['vendorProfile.status'] = status;
    }

    const vendors = await User.find(query).select('-password -refreshTokens').sort({ createdAt: -1 });
    res.json({ success: true, data: { vendors } });
  } catch (err) {
    next(err);
  }
}

export async function updateVendorStatus(req, res, next) {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new AppError('Invalid status. Allowed: approved, rejected, pending', 400, 'VALIDATION_ERROR');
    }

    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });
    if (!vendor) {
      throw new AppError('Vendor not found', 404, 'NOT_FOUND');
    }

    vendor.vendorProfile = vendor.vendorProfile || {};
    vendor.vendorProfile.status = status;
    if (status === 'rejected') {
      vendor.vendorProfile.rejectionReason = rejectionReason || 'Requirements not met';
    } else if (status === 'approved') {
      vendor.vendorProfile.rejectionReason = '';
    }

    await vendor.save();

    // FR-42: Write audit log for vendor status changes
    await AuditLog.create({
      action: `VENDOR_${status.toUpperCase()}`,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: vendor._id,
      targetType: 'User',
      details: { status, rejectionReason },
      ip: req.ip
    });

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          vendorProfile: vendor.vendorProfile
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function applyVendorKYC(req, res, next) {
  try {
    const { storeName, storeDescription, kycDocumentUrl, handlingDays } = req.body;
    const user = await User.findById(req.user._id);

    user.vendorProfile = user.vendorProfile || {};
    if (storeName) user.vendorProfile.storeName = storeName.trim();
    if (storeDescription) user.vendorProfile.storeDescription = storeDescription.trim();
    if (kycDocumentUrl) user.vendorProfile.kycDocumentUrl = kycDocumentUrl;
    if (handlingDays !== undefined) {
      user.vendorProfile.handlingDays = Math.min(7, Math.max(0, parseInt(handlingDays, 10) || 2));
    }
    user.vendorProfile.status = 'pending';

    await user.save();

    res.json({ success: true, data: { vendorProfile: user.vendorProfile } });
  } catch (err) {
    next(err);
  }
}
