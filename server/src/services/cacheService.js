const NodeCache = require('node-cache');

// Standard TTL is 10 seconds for high-traffic real-time data like rankings
// Check for expired keys every 15 seconds
const cache = new NodeCache({ stdTTL: 10, checkperiod: 15 });

const getFromCache = (key) => {
  return cache.get(key);
};

const setToCache = (key, data, ttl = 10) => {
  cache.set(key, data, ttl);
};

const clearCachePrefix = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(k => k.startsWith(prefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
  }
};

module.exports = {
  cache,
  getFromCache,
  setToCache,
  clearCachePrefix
};
