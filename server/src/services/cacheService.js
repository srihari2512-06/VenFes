// Cache Service with TTL and in-memory fallback (FR-29, S15)
const memoryStore = new Map();

export async function getCache(key) {
  // shortcut: in-memory fallback cache when Redis is unavailable, upgrade to Redis cluster in prod
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function setCache(key, value, ttlSeconds = 60) {
  memoryStore.set(key, {
    value,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

export async function invalidateCache(prefix) {
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}
