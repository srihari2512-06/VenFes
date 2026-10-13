import test from 'node:test';
import assert from 'node:assert/strict';
import { getCache, setCache, invalidateCache } from '../src/services/cacheService.js';

test('Cache Service - S15: sets, gets, expires and invalidates cached data', async () => {
  const key = 'analytics:test:123';
  const data = { gmv: 50000, orders: 12 };

  await setCache(key, data, 10);
  const retrieved = await getCache(key);
  assert.deepEqual(retrieved, data);

  // Invalidate cache
  await invalidateCache('analytics:test');
  const afterInvalidate = await getCache(key);
  assert.equal(afterInvalidate, null);
});
