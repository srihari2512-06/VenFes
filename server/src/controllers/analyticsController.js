import mongoose from 'mongoose';
import { SubOrder } from '../models/SubOrder.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { getCache, setCache } from '../services/cacheService.js';

export async function getVendorAnalytics(req, res, next) {
  try {
    const vendorId = req.user._id;
    const cacheKey = `analytics:vendor:${vendorId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, cached: true, data: cached });
    }

    const matchVendor = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
      status: { $nin: ['cancelled', 'refunded'] }
    };

    // 1. Total revenue and order count
    const totals = await SubOrder.aggregate([
      { $match: matchVendor },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$vendorPayoutAmount' },
          totalSales: { $sum: '$subtotal' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // 2. Revenue trend over time (by day)
    const salesTrend = await SubOrder.aggregate([
      { $match: matchVendor },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$vendorPayoutAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Top selling products
    const topProducts = await SubOrder.aggregate([
      { $match: matchVendor },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    const result = {
      summary: totals[0] || { totalRevenue: 0, totalSales: 0, orderCount: 0 },
      salesTrend,
      topProducts
    };

    await setCache(cacheKey, result, 60); // 60s TTL
    res.json({ success: true, cached: false, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getAdminAnalytics(req, res, next) {
  try {
    const cacheKey = 'analytics:admin:dashboard';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, cached: true, data: cached });
    }

    // 1. GMV and total parent orders (FR-26)
    const gmvStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          gmv: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // 2. Active vendor count
    const activeVendors = await User.countDocuments({
      role: 'vendor',
      'vendorProfile.status': 'approved'
    });

    // 3. Category performance
    const categoryStats = await SubOrder.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          category: { $first: '$product.category' },
          revenue: { $sum: '$items.subtotal' },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 4. Cohort retention aggregation (FR-41)
    const cohortStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$customerId',
          firstOrderMonth: { $min: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: '$firstOrderMonth',
          cohort: { $first: '$firstOrderMonth' },
          customerCount: { $sum: 1 },
          repeatCustomers: {
            $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
          },
          avgSpent: { $avg: '$totalSpent' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = {
      summary: {
        gmv: gmvStats[0]?.gmv || 0,
        paidOrders: gmvStats[0]?.orderCount || 0,
        activeVendors
      },
      categoryStats,
      cohortStats
    };

    await setCache(cacheKey, result, 60);
    res.json({ success: true, cached: false, data: result });
  } catch (err) {
    next(err);
  }
}
