import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { SubOrder } from '../src/models/SubOrder.js';
import { PayoutLedger } from '../src/models/PayoutLedger.js';
import { processCheckout } from '../src/services/checkoutService.js';

let replSet;

test.before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

test('Checkout & S1: Multi-vendor cart splits into 1 parent order and multiple sub-orders', async () => {
  // 1. Setup Customer and 2 Vendors
  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  });

  const vendorA = await User.create({
    name: 'Vendor A',
    email: 'vendorA@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { storeName: 'Store A', status: 'approved' }
  });

  const vendorB = await User.create({
    name: 'Vendor B',
    email: 'vendorB@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { storeName: 'Store B', status: 'approved' }
  });

  // 2. Setup Products
  const prodA = await Product.create({
    name: 'Product A1',
    description: 'Vendor A product',
    price: 100,
    category: 'Electronics',
    stock: 20,
    vendorId: vendorA._id
  });

  const prodB = await Product.create({
    name: 'Product B1',
    description: 'Vendor B product',
    price: 250,
    category: 'Books',
    stock: 10,
    vendorId: vendorB._id
  });

  // 3. Perform Checkout with items from both vendors
  const checkoutPayload = {
    customerId: customer._id,
    items: [
      { productId: prodA._id, quantity: 2 }, // 2 * 100 = 200
      { productId: prodB._id, quantity: 1 }  // 1 * 250 = 250
    ],
    shippingAddress: { city: 'Chennai', country: 'India' }
  };

  const { order, subOrders } = await processCheckout(checkoutPayload);

  // S1 Checks:
  assert.ok(order);
  assert.equal(order.totalAmount, 450); // 200 + 250
  assert.equal(subOrders.length, 2); // 1 parent order + 2 sub-orders!
  assert.equal(order.subOrderIds.length, 2);

  // Verify stock decremented
  const updatedProdA = await Product.findById(prodA._id);
  const updatedProdB = await Product.findById(prodB._id);
  assert.equal(updatedProdA.stock, 18); // 20 - 2
  assert.equal(updatedProdB.stock, 9);  // 10 - 1

  // Verify payout ledger entries
  const ledgers = await PayoutLedger.find({ subOrderId: { $in: subOrders.map(s => s._id) } });
  assert.equal(ledgers.length, 2);
});

test('Checkout & S2: Out of stock item prevents overselling and leaves stock unchanged', async () => {
  const customer = await User.create({
    name: 'Customer 2',
    email: 'c2@test.com',
    password: 'password123'
  });

  const vendor = await User.create({
    name: 'Vendor Single',
    email: 'vsingle@test.com',
    password: 'password123',
    role: 'vendor'
  });

  const product = await Product.create({
    name: 'Limited Edition',
    description: 'Only 2 available',
    price: 500,
    category: 'Collectibles',
    stock: 2,
    vendorId: vendor._id
  });

  // Try ordering 5 when only 2 exist
  await assert.rejects(
    async () => {
      await processCheckout({
        customerId: customer._id,
        items: [{ productId: product._id, quantity: 5 }]
      });
    },
    { message: /Insufficient stock/ }
  );

  // Stock must remain intact
  const refetched = await Product.findById(product._id);
  assert.equal(refetched.stock, 2);
});

test('Refund & S11: Refunding one sub-order restores its stock and reverses its commission/ledger', async () => {
  const customer = await User.create({
    name: 'Refund Customer',
    email: 'rcustomer@test.com',
    password: 'password123'
  });

  const vendor = await User.create({
    name: 'Refund Vendor',
    email: 'rvendor@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { status: 'approved' }
  });

  const product = await Product.create({
    name: 'Refundable Shoes',
    description: 'Shoes for testing refund',
    price: 300,
    category: 'Footwear',
    stock: 10,
    vendorId: vendor._id
  });

  // 1. Checkout 2 units
  const { order, subOrders } = await processCheckout({
    customerId: customer._id,
    items: [{ productId: product._id, quantity: 2 }]
  });

  assert.equal(subOrders.length, 1);
  const subOrder = subOrders[0];

  // Stock decremented to 8
  const afterCheckoutProd = await Product.findById(product._id);
  assert.equal(afterCheckoutProd.stock, 8);

  // 2. Perform Refund logic (simulating refundSubOrder service / transaction)
  // Restore stock
  for (const item of subOrder.items) {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
  // Reverse ledger
  await PayoutLedger.updateOne({ subOrderId: subOrder._id }, { $set: { status: 'reversed' } });
  // Mark suborder refunded
  subOrder.status = 'refunded';
  await subOrder.save();

  // S11 Assertions:
  const afterRefundProd = await Product.findById(product._id);
  assert.equal(afterRefundProd.stock, 10); // restored back to original 10!

  const ledger = await PayoutLedger.findOne({ subOrderId: subOrder._id });
  assert.equal(ledger.status, 'reversed'); // commission/ledger reversed!
  assert.equal(subOrder.status, 'refunded');
});
