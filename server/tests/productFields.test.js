import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateProductCSV } from '../src/utils/csvParser.js';
import { Product } from '../src/models/Product.js';
import mongoose from 'mongoose';

test('Product Fields - CSV parser rejects MRP below price', () => {
  const csv = `name,price,mrp,category,stock
Gaming Mouse,1200,999,Electronics,10`;
  const result = parseAndValidateProductCSV(csv, new mongoose.Types.ObjectId());
  assert.equal(result.imported.length, 0);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].reason, /MRP .* must be greater than or equal to price/);
});

test('Product Fields - CSV parser rejects highlights exceeding 6 items', () => {
  const csv = `name,price,mrp,category,stock,highlights
Mechanical Keyboard,2000,2500,Electronics,10,H1|H2|H3|H4|H5|H6|H7`;
  const result = parseAndValidateProductCSV(csv, new mongoose.Types.ObjectId());
  assert.equal(result.imported.length, 0);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].reason, /Highlights cannot exceed 6 items/);
});

test('Product Fields - Schema validates MRP and highlights constraints', async () => {
  const dummyVendorId = new mongoose.Types.ObjectId();

  // Test MRP below price is rejected
  const invalidMrpProduct = new Product({
    name: 'Test Earbuds',
    description: 'Crisp wireless audio',
    price: 1500,
    mrp: 1200, // Invalid: mrp < price
    category: 'Electronics',
    stock: 5,
    vendorId: dummyVendorId
  });

  const mrpError = invalidMrpProduct.validateSync();
  assert.ok(mrpError, 'Expected validation error for MRP below price');
  assert.match(mrpError.errors['mrp'].message, /MRP must be greater than or equal to/);

  // Test highlights > 6 rejected
  const invalidHighlightsProduct = new Product({
    name: 'Test Earbuds 2',
    description: 'Crisp wireless audio',
    price: 1500,
    mrp: 2000,
    highlights: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'], // 7 items
    category: 'Electronics',
    stock: 5,
    vendorId: dummyVendorId
  });

  const highlightsError = invalidHighlightsProduct.validateSync();
  assert.ok(highlightsError, 'Expected validation error for too many highlights');
  assert.match(highlightsError.errors['highlights'].message, /at most 6 highlights/);

  // Test legacy product without new fields validates cleanly
  const legacyProduct = new Product({
    name: 'Legacy Notebook',
    description: 'Plain paper notebook',
    price: 99,
    category: 'Books',
    stock: 20,
    vendorId: dummyVendorId
  });

  const legacyError = legacyProduct.validateSync();
  assert.equal(legacyError, undefined, 'Old product without new fields must validate cleanly');
});
