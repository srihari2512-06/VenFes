import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found or deactivated' }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
    });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Access denied: insufficient permissions' }
      });
    }
    next();
  };
}

export function requireApprovedVendor(req, res, next) {
  if (req.user.role === 'admin') return next();
  if (req.user.role !== 'vendor' || req.user.vendorProfile?.status !== 'approved') {
    return res.status(403).json({
      error: { code: 'VENDOR_NOT_APPROVED', message: 'Vendor store is pending approval or rejected' }
    });
  }
  next();
}

export function assertOwnership(resourceOwnerId, reqUser) {
  if (reqUser.role === 'admin') return true;
  const ownerString = resourceOwnerId?._id ? resourceOwnerId._id.toString() : resourceOwnerId?.toString();
  return ownerString === reqUser._id.toString();
}
