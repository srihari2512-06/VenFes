import { PlatformSetting } from '../models/PlatformSetting.js';
import { PayoutLedger } from '../models/PayoutLedger.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getCommissionRate(req, res, next) {
  try {
    const setting = await PlatformSetting.findOne({ key: 'commissionRate' });
    const rate = setting ? Number(setting.value) : 0.10;
    res.json({ success: true, data: { commissionRate: rate } });
  } catch (err) {
    next(err);
  }
}

export async function updateCommissionRate(req, res, next) {
  try {
    const { rate } = req.body;
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 1) {
      throw new AppError('Commission rate must be a decimal between 0 and 1 (e.g. 0.10 for 10%)', 400, 'VALIDATION_ERROR');
    }

    const setting = await PlatformSetting.findOneAndUpdate(
      { key: 'commissionRate' },
      { value: numRate },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      action: 'UPDATE_COMMISSION_RATE',
      actorId: req.user._id,
      actorRole: req.user.role,
      details: { newRate: numRate },
      ip: req.ip
    });

    res.json({ success: true, data: { commissionRate: setting.value } });
  } catch (err) {
    next(err);
  }
}

export async function getPayoutLedger(req, res, next) {
  try {
    const query = {};
    if (req.user.role === 'vendor') {
      query.vendorId = req.user._id;
    } else if (req.query.vendorId) {
      query.vendorId = req.query.vendorId;
    }

    const ledger = await PayoutLedger.find(query)
      .populate('vendorId', 'name vendorProfile.storeName')
      .populate('subOrderId', 'subOrderNumber subtotal status')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { ledger } });
  } catch (err) {
    next(err);
  }
}

export async function settlePayout(req, res, next) {
  try {
    const entry = await PayoutLedger.findById(req.params.id);
    if (!entry) {
      throw new AppError('Ledger entry not found', 404, 'NOT_FOUND');
    }

    if (entry.status !== 'accrued') {
      throw new AppError(`Cannot settle entry in status ${entry.status}`, 400, 'INVALID_STATE');
    }

    entry.status = 'settled';
    entry.settledAt = new Date();
    entry.settledBy = req.user._id;
    await entry.save();

    await AuditLog.create({
      action: 'SETTLE_PAYOUT',
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: entry._id,
      targetType: 'PayoutLedger',
      details: { amount: entry.amount, vendorId: entry.vendorId },
      ip: req.ip
    });

    res.json({ success: true, data: { entry } });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
}
