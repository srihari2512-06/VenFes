import test from 'node:test';
import assert from 'node:assert/strict';
import { formatINR, calcDiscountPercent } from '../../client/src/utils/formatters.js';

test('Formatters - formatINR formats correctly with Indian numbering system', () => {
  assert.equal(formatINR(0).replace(/\u00a0/g, ' '), '₹0');
  assert.equal(formatINR(999).replace(/\u00a0/g, ' '), '₹999');
  assert.equal(formatINR(123456).replace(/\u00a0/g, ' '), '₹1,23,456');
  assert.equal(formatINR('5000000').replace(/\u00a0/g, ' '), '₹50,00,000');
  assert.equal(formatINR(null).replace(/\u00a0/g, ' '), '₹0');
  assert.equal(formatINR(undefined).replace(/\u00a0/g, ' '), '₹0');
  assert.equal(formatINR('invalid').replace(/\u00a0/g, ' '), '₹0');
});

test('Formatters - calcDiscountPercent calculates percentage correctly', () => {
  // Exact 25% off
  assert.equal(calcDiscountPercent(1000, 750), 25);
  // String inputs
  assert.equal(calcDiscountPercent('2000', '1500'), 25);
  // Rounding
  assert.equal(calcDiscountPercent(999, 499), 50);
  // MRP <= price returns 0
  assert.equal(calcDiscountPercent(500, 500), 0);
  assert.equal(calcDiscountPercent(400, 500), 0);
  // Zero, null, undefined or negative returns 0
  assert.equal(calcDiscountPercent(0, 100), 0);
  assert.equal(calcDiscountPercent(null, 100), 0);
  assert.equal(calcDiscountPercent(undefined, 100), 0);
  assert.equal(calcDiscountPercent(-100, 50), 0);
});
