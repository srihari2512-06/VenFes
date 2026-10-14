// In-memory client API cache to eliminate redundant network fetches and loading skeleton flashes
const memoryCache = new Map();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchWithCache(url, options = {}, ttlMs = DEFAULT_TTL_MS) {
  const method = options.method || 'GET';

  // Only cache GET requests without custom mutation headers
  if (method.toUpperCase() === 'GET') {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data;
    }
  }

  const res = await fetch(url, options);
  const json = await res.json();

  if (res.ok && json.success && method.toUpperCase() === 'GET') {
    memoryCache.set(url, {
      data: json,
      timestamp: Date.now()
    });
  }

  return json;
}

export function getCachedData(url, ttlMs = DEFAULT_TTL_MS) {
  const cached = memoryCache.get(url);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }
  return null;
}

export function setCachedData(url, data) {
  memoryCache.set(url, {
    data,
    timestamp: Date.now()
  });
}

export function invalidateCache(urlPattern) {
  if (!urlPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPattern)) {
      memoryCache.delete(key);
    }
  }
}
