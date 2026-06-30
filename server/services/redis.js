const { createClient } = require('redis');

let client = null;
let initialized = false;

function init() {
  if (initialized) return client;
  initialized = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn(
      '[redis] REDIS_URL not set — falling back to in-memory store. ' +
      'OK for local dev; required on Vercel for sessions/cache to persist.'
    );
    return null;
  }

  client = createClient({ url });

  client.on('error', err => {
    console.error('[redis] client error:', err.message);
  });

  client.on('ready', () => {
    console.log('[redis] connected');
  });

  // Kick off connection eagerly. node-redis v4 queues commands until ready.
  client.connect().catch(err => {
    console.error('[redis] connection failed, falling back to in-memory:', err.message);
    client = null;
  });

  return client;
}

function getRedisClient() {
  if (!initialized) init();
  return client;
}

module.exports = { getRedisClient };
