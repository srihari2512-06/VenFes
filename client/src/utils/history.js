const HISTORY_KEY = 'venfes_browsing_history';
const MAX_HISTORY = 20;

export function getBrowsingHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToBrowsingHistory(product) {
  if (!product || !product._id) return;
  try {
    const history = getBrowsingHistory();
    // Remove if already exists to push to front
    const filtered = history.filter(item => item._id !== product._id);
    const item = {
      _id: product._id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      brand: product.brand,
      category: product.category,
      images: product.images,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
      viewedAt: new Date().toISOString()
    };
    filtered.unshift(item);
    const capped = filtered.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
  } catch (err) {
    console.error('Failed to update browsing history', err);
  }
}

export function removeFromBrowsingHistory(productId) {
  try {
    const history = getBrowsingHistory().filter(item => item._id !== productId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return [];
  }
}

export function clearBrowsingHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}
