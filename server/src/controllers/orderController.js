import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { SubOrder } from '../models/SubOrder.js';
import { Product } from '../models/Product.js';
import { PayoutLedger } from '../models/PayoutLedger.js';
import { ProcessedEvent } from '../models/ProcessedEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { processCheckout } from '../services/checkoutService.js';
import { paymentGateway } from '../services/paymentService.js';
import { emitToAdmin, emitToVendor } from '../services/socketService.js';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/emailService.js';

// Allowed sub-order status transitions enforced server-side (FR-11)
const ALLOWED_TRANSITIONS = {
  placed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: []
};

export async function createCheckout(req, res, next) {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const { order, subOrders } = await processCheckout({
      customerId: req.user._id,
      items,
      shippingAddress,
      paymentMethod
    });

    const paymentOrder = await paymentGateway.createPaymentOrder({
      amount: order.totalAmount,
      receipt: order.orderNumber
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        subOrders,
        paymentOrder
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmPayment(req, res, next) {
  try {
    const { orderId, paymentId, signature, paymentMethod } = req.body;
    const order = await Order.findById(orderId).populate('subOrderIds');
    if (!order) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    if (order.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Order already paid', data: { order } });
    }

    const effectiveMethod = paymentMethod || order.paymentMethod || 'razorpay';
    order.paymentMethod = effectiveMethod;

    if (effectiveMethod === 'cod') {
      // Cash on Delivery: marked pending or confirmed for fulfillment
      order.paymentStatus = 'pending';
      order.paymentDetails = {
        transactionId: paymentId || `COD-${Date.now()}`,
        signature: 'cash_on_delivery_confirmed'
      };
      await order.save();

      await SubOrder.updateMany(
        { _id: { $in: order.subOrderIds } },
        { $set: { status: 'processing' } }
      );
    } else {
      // Online payment (UPI, Credit/Debit Card, Razorpay)
      const isValid = paymentGateway.verifySignature({
        orderId: order.orderNumber,
        paymentId,
        signature
      });

      if (!isValid) {
        throw new AppError('Invalid payment signature', 400, 'PAYMENT_VERIFICATION_FAILED');
      }

      order.paymentStatus = 'paid';
      order.paymentDetails = { transactionId: paymentId, signature };
      await order.save();

      await SubOrder.updateMany(
        { _id: { $in: order.subOrderIds } },
        { $set: { status: 'processing' } }
      );
    }

    // Real-time notification to admin and vendors (FR-28, S6)
    emitToAdmin('order:created', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemCount: order.subOrderIds.length
    });

    for (const subOrder of order.subOrderIds) {
      emitToVendor(subOrder.vendorId.toString(), 'suborder:created', {
        subOrderId: subOrder._id,
        subOrderNumber: subOrder.subOrderNumber,
        subtotal: subOrder.subtotal
      });
    }

    // Email customer (FR-35, S14)
    sendOrderConfirmationEmail(order, req.user.email);

    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const eventId = req.headers['x-event-id'] || req.body?.eventId || `evt_${Date.now()}`;
    const eventType = req.body?.event || 'payment.captured';

    // FR-36 / S12: Idempotent event processing
    const existing = await ProcessedEvent.findOne({ eventId });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    await ProcessedEvent.create({
      eventId,
      eventType,
      payload: req.body
    });

    const paymentDetails = req.body?.payload?.payment?.entity || req.body;
    if (paymentDetails?.receipt) {
      const order = await Order.findOne({ orderNumber: paymentDetails.receipt });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paymentDetails = {
          transactionId: paymentDetails.id,
          orderId: paymentDetails.order_id
        };
        await order.save();
        await SubOrder.updateMany(
          { _id: { $in: order.subOrderIds } },
          { $set: { status: 'processing' } }
        );
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerOrders(req, res, next) {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate({
        path: 'subOrderIds',
        populate: { path: 'vendorId', select: 'name vendorProfile.storeName' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { orders } });
  } catch (err) {
    next(err);
  }
}

export async function getVendorSubOrders(req, res, next) {
  try {
    const subOrders = await SubOrder.find({ vendorId: req.user._id })
      .populate('customerId', 'name email')
      .populate('parentOrderId', 'orderNumber paymentStatus createdAt shippingAddress')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { subOrders } });
  } catch (err) {
    next(err);
  }
}

export async function updateSubOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const subOrder = await SubOrder.findById(req.params.id);
    if (!subOrder) {
      throw new AppError('Sub-order not found', 404, 'NOT_FOUND');
    }

    // Ownership check (FR-05)
    if (req.user.role !== 'admin' && subOrder.vendorId.toString() !== req.user._id.toString()) {
      throw new AppError('Forbidden: you do not own this sub-order', 403, 'FORBIDDEN');
    }

    // Allowed transition check (FR-11)
    const allowedNext = ALLOWED_TRANSITIONS[subOrder.status] || [];
    if (!allowedNext.includes(status)) {
      throw new AppError(
        `Invalid status transition from '${subOrder.status}' to '${status}'. Allowed: ${allowedNext.join(', ')}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    subOrder.status = status;
    subOrder.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await subOrder.save();

    // If customer email exists, send status update email
    const customer = await User.findById(subOrder.customerId);
    if (customer) {
      sendOrderStatusUpdateEmail(subOrder, customer.email);
    }

    res.json({ success: true, data: { subOrder } });
  } catch (err) {
    next(err);
  }
}

export async function refundSubOrder(req, res, next) {
  let session = null;
  const topoType = mongoose.connection?.client?.topology?.description?.type;
  const isReplicaOrSharded = topoType && topoType !== 'Single' && (topoType.includes('ReplicaSet') || topoType.includes('Sharded'));

  if (isReplicaOrSharded) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }
  }

  try {
    const subOrder = await SubOrder.findById(req.params.id);
    if (!subOrder) {
      throw new AppError('Sub-order not found', 404, 'NOT_FOUND');
    }

    if (subOrder.status === 'refunded') {
      throw new AppError('Sub-order already refunded', 400, 'ALREADY_REFUNDED');
    }

    // Restore stock for items in this sub-order (FR-37, S11)
    for (const item of subOrder.items) {
      if (item.variantId) {
        const updateQuery = { _id: item.productId, 'variants._id': item.variantId };
        const updateDoc = { $inc: { 'variants.$.stock': item.quantity, stock: item.quantity } };
        if (session) await Product.updateOne(updateQuery, updateDoc).session(session);
        else await Product.updateOne(updateQuery, updateDoc);
      } else {
        const updateQuery = { _id: item.productId };
        const updateDoc = { $inc: { stock: item.quantity } };
        if (session) await Product.updateOne(updateQuery, updateDoc).session(session);
        else await Product.updateOne(updateQuery, updateDoc);
      }
    }

    // Reverse payout ledger entry
    if (session) {
      await PayoutLedger.updateOne({ subOrderId: subOrder._id }, { $set: { status: 'reversed' } }).session(session);
    } else {
      await PayoutLedger.updateOne({ subOrderId: subOrder._id }, { $set: { status: 'reversed' } });
    }

    // Update sub-order status
    subOrder.status = 'refunded';
    subOrder.statusHistory.push({
      status: 'refunded',
      changedAt: new Date(),
      changedBy: req.user._id
    });

    if (session) await subOrder.save({ session });
    else await subOrder.save();

    // Audit log (FR-42)
    const auditDoc = {
      action: 'SUBORDER_REFUND',
      actorId: req.user._id,
      actorRole: req.user.role,
      targetId: subOrder._id,
      targetType: 'SubOrder',
      details: { amount: subOrder.subtotal, subOrderNumber: subOrder.subOrderNumber },
      ip: req.ip
    };
    if (session) await AuditLog.create([auditDoc], { session });
    else await AuditLog.create(auditDoc);

    if (session) await session.commitTransaction();

    res.json({ success: true, message: 'Sub-order refunded and stock restored', data: { subOrder } });
  } catch (err) {
    if (session) await session.abortTransaction();
    next(err);
  } finally {
    if (session) session.endSession();
  }
}
