import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { SubOrder } from '../models/SubOrder.js';
import { PayoutLedger } from '../models/PayoutLedger.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../middleware/errorHandler.js';

export async function processCheckout({ customerId, items, shippingAddress, paymentMethod = 'razorpay' }) {
  if (!items || items.length === 0) {
    throw new AppError('Checkout requires at least one item', 400, 'EMPTY_CART');
  }

  let session = null;
  let supportsTransactions = true;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // shortcut: standalone local mongo without replica set cannot run multi-doc transactions, upgrade to Atlas/replica set in production
    supportsTransactions = false;
    session = null;
  }

  try {
    // 1. Fetch platform commission rate (default 10%)
    const commissionSetting = await PlatformSetting.findOne({ key: 'commissionRate' });
    const commissionRate = commissionSetting ? Number(commissionSetting.value) : 0.10;

    // 2. Fetch all products and validate server-side pricing & stock
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    const itemsByVendor = new Map();
    let calculatedTotal = 0;

    // Validate every item and atomically reserve stock
    for (const item of items) {
      const product = productMap.get(item.productId.toString());
      if (!product || !product.isPublished || product.isFlagged) {
        throw new AppError(`Product unavailable: ${item.productId}`, 400, 'PRODUCT_UNAVAILABLE');
      }

      let price = product.price;
      let variantSku = '';
      let variantInfo = '';

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          throw new AppError(`Variant not found for product ${product.name}`, 400, 'VARIANT_NOT_FOUND');
        }
        if (variant.price !== undefined && variant.price !== null) {
          price = variant.price;
        }
        variantSku = variant.sku || '';
        variantInfo = [variant.size, variant.color].filter(Boolean).join(' / ');

        // Decrement variant stock atomically to prevent race condition (FR-19)
        const updateQuery = {
          _id: product._id,
          'variants._id': variant._id,
          'variants.stock': { $gte: item.quantity },
          stock: { $gte: item.quantity }
        };
        const updateDoc = {
          $inc: {
            'variants.$.stock': -item.quantity,
            stock: -item.quantity
          }
        };

        const res = session
          ? await Product.updateOne(updateQuery, updateDoc).session(session)
          : await Product.updateOne(updateQuery, updateDoc);

        if (res.modifiedCount === 0) {
          throw new AppError(`Insufficient stock for ${product.name} (${variantInfo})`, 409, 'OUT_OF_STOCK');
        }
      } else {
        // Decrement parent product stock atomically (FR-19)
        const updateQuery = {
          _id: product._id,
          stock: { $gte: item.quantity }
        };
        const updateDoc = {
          $inc: { stock: -item.quantity }
        };

        const res = session
          ? await Product.updateOne(updateQuery, updateDoc).session(session)
          : await Product.updateOne(updateQuery, updateDoc);

        if (res.modifiedCount === 0) {
          throw new AppError(`Insufficient stock for ${product.name}`, 409, 'OUT_OF_STOCK');
        }
      }

      const itemSubtotal = price * item.quantity;
      calculatedTotal += itemSubtotal;

      const vendorIdStr = product.vendorId.toString();
      if (!itemsByVendor.has(vendorIdStr)) {
        itemsByVendor.set(vendorIdStr, []);
      }

      itemsByVendor.get(vendorIdStr).push({
        productId: product._id,
        productName: product.name,
        variantId: item.variantId || null,
        variantSku,
        variantInfo,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // 3. Create parent order skeleton
    const orderTimestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${orderTimestamp}-${randomSuffix}`;

    const parentOrder = new Order({
      orderNumber,
      customerId,
      totalAmount: calculatedTotal,
      paymentMethod,
      shippingAddress: shippingAddress || {},
      paymentStatus: 'pending',
      subOrderIds: []
    });

    if (session) await parentOrder.save({ session });
    else await parentOrder.save();

    // 4. Create sub-orders grouped by vendor (FR-16, FR-22)
    const createdSubOrders = [];
    let vendorIndex = 1;

    for (const [vendorId, vendorItems] of itemsByVendor.entries()) {
      const vendorSubtotal = vendorItems.reduce((acc, curr) => acc + curr.subtotal, 0);
      const commissionAmount = Math.round(vendorSubtotal * commissionRate * 100) / 100;
      const vendorPayoutAmount = Math.round((vendorSubtotal - commissionAmount) * 100) / 100;
      const subOrderNumber = `SUB-${orderNumber.replace('ORD-', '')}-${vendorIndex++}`;

      const subOrder = new SubOrder({
        subOrderNumber,
        parentOrderId: parentOrder._id,
        vendorId,
        customerId,
        items: vendorItems,
        subtotal: vendorSubtotal,
        commissionRate,
        commissionAmount,
        vendorPayoutAmount,
        status: 'placed',
        statusHistory: [{ status: 'placed', changedAt: new Date(), changedBy: customerId }]
      });

      if (session) await subOrder.save({ session });
      else await subOrder.save();

      // Record accrued vendor payout ledger entry (FR-22)
      const ledgerEntry = new PayoutLedger({
        vendorId,
        subOrderId: subOrder._id,
        amount: vendorPayoutAmount,
        commission: commissionAmount,
        status: 'accrued'
      });

      if (session) await ledgerEntry.save({ session });
      else await ledgerEntry.save();

      createdSubOrders.push(subOrder);
      parentOrder.subOrderIds.push(subOrder._id);
    }

    // Update parent order with sub-order IDs
    if (session) await parentOrder.save({ session });
    else await parentOrder.save();

    // 5. Clear customer's cart
    if (session) await Cart.updateOne({ userId: customerId }, { $set: { items: [] } }).session(session);
    else await Cart.updateOne({ userId: customerId }, { $set: { items: [] } });

    // Commit transaction if active
    if (session) {
      await session.commitTransaction();
    }

    return {
      order: parentOrder,
      subOrders: createdSubOrders
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
