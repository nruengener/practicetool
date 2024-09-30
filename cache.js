const NodeCache = require('node-cache');

// Create a new cache instance
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes by default

// Helper function to get or set cache
const getOrSetCache = async (key, cb) => {
  const value = cache.get(key);
  if (value) {
    return value;
  }

  const result = await cb();
  cache.set(key, result);
  return result;
};

module.exports = {
  cache,
  getOrSetCache,
};