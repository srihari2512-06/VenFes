import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { SubOrder } from '../models/SubOrder.js';
import { Wishlist, ModerationFlag } from '../models/Engagement.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createReview(req, res, next) {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) {
      throw new AppError('ProductId and rating (1-5) required', 400, 'VALIDATION_ERROR');
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR');
    }

    // Verify delivered purchase (FR-31, S13)
    const deliveredSubOrder = await SubOrder.findOne({
      customerId: req.user._id,
      status: 'delivered',
      'items.productId': productId
    });

    if (!deliveredSubOrder) {
      throw new AppError('Reviews are only allowed after verified delivery of this product', 403, 'VERIFIED_PURCHASE_REQUIRED');
    }

    const existingReview = await Review.findOne({
      productId,
      customerId: req.user._id
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400, 'REVIEW_ALREADY_EXISTS');
    }

    const review = await Review.create({
      productId,
      customerId: req.user._id,
      subOrderId: deliveredSubOrder._id,
      rating: numRating,
      comment: comment?.trim() || ''
    });

    // Recompute product ratings
    const stats = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].count
      });
    }

    res.status(201).json({ success: true, data: { review } });
  } catch (err) {
    next(err);
  }
}

export async function getProductReviews(req, res, next) {
  try {
    const reviews = await Review.find({ productId: req.params.productId, isFlagged: false })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { reviews } });
  } catch (err) {
    next(err);
  }
}

export async function getWishlist(req, res, next) {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, products: [] });
    }
    res.json({ success: true, data: { wishlist } });
  } catch (err) {
    next(err);
  }
}

export async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] });
    }

    const prodIndex = wishlist.products.findIndex(id => id.toString() === productId);
    let inWishlist = false;

    if (prodIndex > -1) {
      wishlist.products.splice(prodIndex, 1);
    } else {
      wishlist.products.push(productId);
      inWishlist = true;
    }

    await wishlist.save();
    const populated = await Wishlist.findById(wishlist._id).populate('products');
    res.json({ success: true, data: { inWishlist, wishlist: populated } });
  } catch (err) {
    next(err);
  }
}

export async function flagItem(req, res, next) {
  try {
    const { targetId, targetType, reason } = req.body;
    if (!targetId || !targetType || !reason) {
      throw new AppError('TargetId, targetType (Product/Review), and reason required', 400, 'VALIDATION_ERROR');
    }

    const flag = await ModerationFlag.create({
      reporterId: req.user._id,
      targetId,
      targetType,
      reason: reason.trim()
    });

    res.status(201).json({ success: true, data: { flag } });
  } catch (err) {
    next(err);
  }
}

export async function getModerationQueue(req, res, next) {
  try {
    const flags = await ModerationFlag.find({ status: 'pending' })
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { flags } });
  } catch (err) {
    next(err);
  }
}

export async function resolveModeration(req, res, next) {
  try {
    const { action } = req.body; // 'hide', 'restore', 'dismiss'
    const flag = await ModerationFlag.findById(req.params.id);
    if (!flag) {
      throw new AppError('Flag not found', 404, 'NOT_FOUND');
    }

    if (action === 'hide') {
      if (flag.targetType === 'Product') {
        await Product.findByIdAndUpdate(flag.targetId, { isFlagged: true });
      } else if (flag.targetType === 'Review') {
        await Review.findByIdAndUpdate(flag.targetId, { isFlagged: true });
      }
      flag.status = 'resolved';
    } else if (action === 'restore') {
      if (flag.targetType === 'Product') {
        await Product.findByIdAndUpdate(flag.targetId, { isFlagged: false });
      } else if (flag.targetType === 'Review') {
        await Review.findByIdAndUpdate(flag.targetId, { isFlagged: false });
      }
      flag.status = 'resolved';
    } else {
      flag.status = 'dismissed';
    }

    await flag.save();

    await AuditLog.create({
      action: `MODERATION_${action.toUpperCase()}`,
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: flag.targetId,
      targetType: flag.targetType,
      details: { action, reason: flag.reason },
      ip: req.ip
    });

    res.json({ success: true, data: { flag } });
  } catch (err) {
    next(err);
  }
}
