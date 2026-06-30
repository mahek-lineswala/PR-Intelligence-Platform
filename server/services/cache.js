const NodeCache = require('node-cache');
const { getRedisClient } = require('./redis');

const DEFAULT_TTL = 900; // 15 minutes

// In-memory fallback used when REDIS_URL isn't configured.
const memCache = new NodeCache({ stdTTL: DEFAULT_TTL });

async function get(key) {
  const client = getRedisClient();
  if (client && client.isReady) {
    try {
      const raw = await client.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('[cache] redis get failed, falling back:', err.message);
    }
  }
  const value = memCache.get(key);
  return value === undefined ? null : value;
}

async function set(key, value, ttl = DEFAULT_TTL) {
  const client = getRedisClient();
  if (client && client.isReady) {
    try {
      await client.set(key, JSON.stringify(value), { EX: ttl });
      return;
    } catch (err) {
      console.error('[cache] redis set failed, falling back:', err.message);
    }
  }
  memCache.set(key, value, ttl);
}

async function del(key) {
  const client = getRedisClient();
  if (client && client.isReady) {
    try {
      await client.del(key);
    } catch (err) {
      console.error('[cache] redis del failed:', err.message);
    }
  }
  memCache.del(key);
}

module.exports = { get, set, del };
