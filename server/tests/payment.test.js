import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentGateway } from '../src/services/paymentService.js';

test('Payment - Signature verification and order creation (FR-21)', async () => {
  const paymentOrder = await paymentGateway.createPaymentOrder({
    amount: 1500,
    currency: 'INR',
    receipt: 'ORD-TEST-1234'
  });

  assert.ok(paymentOrder.id);
  assert.equal(paymentOrder.amount, 150000); // in paise
  assert.equal(paymentOrder.currency, 'INR');

  // Verify simulated test signature
  const valid = paymentGateway.verifySignature({
    orderId: 'ORD-TEST-1234',
    paymentId: 'pay_test_001',
    signature: 'simulated_valid_signature'
  });
  assert.equal(valid, true);

  const invalid = paymentGateway.verifySignature({
    orderId: 'ORD-TEST-1234',
    paymentId: 'pay_test_001',
    signature: 'bogus_signature'
  });
  assert.equal(invalid, false);
});
