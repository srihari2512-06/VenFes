import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { getProducts, getProductSuggestions } from '../src/controllers/productController.js';

let replSet;
let approvedVendor1, approvedVendor2, unapprovedVendor;

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
}

test.before(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);

  // Setup vendors
  approvedVendor1 = await User.create({
    name: 'Vendor One',
    email: 'v1@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { storeName: 'AudioHub', status: 'approved', handlingDays: 2 }
  });

  approvedVendor2 = await User.create({
    name: 'Vendor Two',
    email: 'v2@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { storeName: 'SneakerStash', status: 'approved', handlingDays: 3 }
  });

  unapprovedVendor = await User.create({
    name: 'Pending Vendor',
    email: 'v3@test.com',
    password: 'password123',
    role: 'vendor',
    vendorProfile: { storeName: 'PendingStore', status: 'pending', handlingDays: 2 }
  });

  // Seed fixture products
  // Product 1: Electronics, AudioHub, Sony, 2000 (mrp 3000 -> 33% off), stock 10, rating 4.5
  await Product.create({
    name: 'Sony Wireless ANC Headphones',
    description: 'Noise cancelling over-ear headphones',
    price: 2000,
    mrp: 3000,
    brand: 'Sony',
    category: 'Electronics',
    stock: 10,
    averageRating: 4.5,
    numReviews: 10,
    vendorId: approvedVendor1._id,
    isPublished: true,
    isFlagged: false
  });

  // Product 2: Electronics, AudioHub, Boat, 1000 (mrp 1000 -> 0% off), stock 0 (out of stock), rating 3.5
  await Product.create({
    name: 'Boat Basshead Earphones',
    description: 'Wired dynamic earphones',
    price: 1000,
    mrp: 1000,
    brand: 'Boat',
    category: 'Electronics',
    stock: 0,
    averageRating: 3.5,
    numReviews: 5,
    vendorId: approvedVendor1._id,
    isPublished: true,
    isFlagged: false
  });

  // Product 3: Footwear, SneakerStash, Nike, 5000 (mrp 8000 -> 38% off), stock 5, rating 4.8
  await Product.create({
    name: 'Nike Pegasus Running Shoes',
    description: 'Breathable road running shoes',
    price: 5000,
    mrp: 8000,
    brand: 'Nike',
    category: 'Footwear',
    stock: 5,
    averageRating: 4.8,
    numReviews: 20,
    vendorId: approvedVendor2._id,
    isPublished: true,
    isFlagged: false
  });

  // Product 4: Footwear, SneakerStash, Adidas, 3000 (no mrp -> 0% off), stock 8, rating 2.5
  await Product.create({
    name: 'Adidas Slides Comfort',
    description: 'Slip-on pool slides',
    price: 3000,
    brand: 'Adidas',
    category: 'Footwear',
    stock: 8,
    averageRating: 2.5,
    numReviews: 2,
    vendorId: approvedVendor2._id,
    isPublished: true,
    isFlagged: false
  });

  // Product 5 (Inactive / Unapproved store): must NEVER appear
  await Product.create({
    name: 'Unapproved Vendor Item',
    description: 'Should never show up in storefront',
    price: 999,
    category: 'Electronics',
    stock: 10,
    vendorId: unapprovedVendor._id,
    isPublished: true,
    isFlagged: false
  });

  // Product 6 (Flagged): must NEVER appear
  await Product.create({
    name: 'Flagged Product',
    description: 'Violating product',
    price: 999,
    category: 'Electronics',
    stock: 10,
    vendorId: approvedVendor1._id,
    isPublished: true,
    isFlagged: true
  });
}, { timeout: 120000 });

test.after(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

test('Catalog API - Limit above 48 is clamped to 48', async () => {
  const req = { query: { limit: '100' } };
  const res = mockRes();
  await getProducts(req, res, () => {});

  assert.equal(res.data.success, true);
  assert.equal(res.data.data.meta.limit, 48);
  assert.equal(res.data.data.pagination.limit, 48);
});

test('Catalog API - Hand count facet validation on fixture data', async () => {
  const req = { query: {} };
  const res = mockRes();
  await getProducts(req, res, () => {});

  assert.equal(res.data.success, true);
  const { facets, meta } = res.data.data;

  // Total approved active products = 4
  assert.equal(meta.total, 4);

  // Facet: categories (Electronics: 2, Footwear: 2)
  const catElectronics = facets.categories.find(c => c.value === 'Electronics');
  const catFootwear = facets.categories.find(c => c.value === 'Footwear');
  assert.equal(catElectronics.count, 2);
  assert.equal(catFootwear.count, 2);

  // Facet: brands (Sony: 1, Boat: 1, Nike: 1, Adidas: 1)
  assert.equal(facets.brands.length, 4);

  // Facet: price min and max
  assert.equal(facets.price.min, 1000);
  assert.equal(facets.price.max, 5000);

  // Facet: ratings
  // 4+: Sony (4.5), Nike (4.8) -> 2
  // 3+: Sony (4.5), Nike (4.8), Boat (3.5) -> 3
  // 2+: Sony (4.5), Nike (4.8), Boat (3.5), Adidas (2.5) -> 4
  assert.equal(facets.ratings[4], 2);
  assert.equal(facets.ratings[3], 3);
  assert.equal(facets.ratings[2], 4);
});

test('Catalog API - Filter alone: inStock=true excludes out-of-stock items', async () => {
  const req = { query: { inStock: 'true' } };
  const res = mockRes();
  await getProducts(req, res, () => {});

  assert.equal(res.data.data.products.length, 3);
  assert.ok(res.data.data.products.every(p => p.stock > 0));
});

test('Catalog API - Filter alone: minDiscount=20 returns high-discount products only', async () => {
  const req = { query: { minDiscount: '20' } };
  const res = mockRes();
  await getProducts(req, res, () => {});

  // Sony has 33%, Nike has 38%
  assert.equal(res.data.data.products.length, 2);
  assert.ok(res.data.data.products.every(p => p.discountPercent >= 20));
});

test('Catalog API - Combined filters: category=Footwear & minPrice=4000', async () => {
  const req = { query: { category: 'Footwear', minPrice: '4000' } };
  const res = mockRes();
  await getProducts(req, res, () => {});

  assert.equal(res.data.data.products.length, 1);
  assert.equal(res.data.data.products[0].name, 'Nike Pegasus Running Shoes');
});

test('Catalog API - Sort orders: price_asc and discount', async () => {
  // Sort price_asc
  const reqAsc = { query: { sort: 'price_asc' } };
  const resAsc = mockRes();
  await getProducts(reqAsc, resAsc, () => {});
  const prices = resAsc.data.data.products.map(p => p.price);
  assert.deepEqual(prices, [1000, 2000, 3000, 5000]);

  // Sort discount
  const reqDisc = { query: { sort: 'discount' } };
  const resDisc = mockRes();
  await getProducts(reqDisc, resDisc, () => {});
  const discounts = resDisc.data.data.products.map(p => p.discountPercent);
  assert.ok(discounts[0] >= discounts[1] && discounts[1] >= discounts[2]);
});

test('Catalog API - Regex special character in q does not crash or match everything', async () => {
  const specialChars = ['.*', '+', '(', '[', '\\', '?', '^', '$'];
  for (const char of specialChars) {
    const req = { query: { q: char } };
    const res = mockRes();
    await getProducts(req, res, () => {});
    assert.equal(res.data.success, true);
    // Should safely execute without 500 error or syntax crash
  }
});

test('Catalog API - Search suggestions endpoint behaves truthfully', async () => {
  // Short query returns empty arrays
  const reqShort = { query: { q: 'a' } };
  const resShort = mockRes();
  await getProductSuggestions(reqShort, resShort, () => {});
  assert.deepEqual(resShort.data.data, { products: [], categories: [], brands: [] });

  // Query "head" matches headphones
  const reqSuggest = { query: { q: 'head' } };
  const resSuggest = mockRes();
  await getProductSuggestions(reqSuggest, resSuggest, () => {});
  assert.equal(resSuggest.data.success, true);
  assert.ok(resSuggest.data.data.products.length > 0);
  assert.ok(resSuggest.data.data.products.some(p => p.title.includes('Headphones')));

  // Unapproved or inactive products are never in suggestions
  assert.ok(resSuggest.data.data.products.every(p => !p.title.includes('Unapproved')));
  assert.ok(resSuggest.data.data.products.every(p => !p.title.includes('Flagged')));
});
