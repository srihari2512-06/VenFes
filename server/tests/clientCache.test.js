import test from 'node:test';
import assert from 'node:assert/strict';
import { getCachedData, setCachedData, invalidateCache } from '../../client/src/utils/apiCache.js';

test('Client ApiCache - sets, gets, and invalidates in-memory category/catalog cache', () => {
  const url = '/api/products?category=Electronics';
  const mockPayload = { success: true, data: { products: [{ _id: '1', name: 'Smartphone' }] } };

  // 1. Initial get is null
  assert.equal(getCachedData(url), null);

  // 2. Set cached data
  setCachedData(url, mockPayload);
  const cached = getCachedData(url);
  assert.deepEqual(cached, mockPayload);

  // 3. TTL expiry simulation
  const expired = getCachedData(url, -1);
  assert.equal(expired, null);

  // 4. Invalidation
  invalidateCache('category=Electronics');
  assert.equal(getCachedData(url), null);
});
