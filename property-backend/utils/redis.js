const { createClient } = require('redis');

// Create Redis client using secure TLS connection
const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    // tls: true, // required for Redis Cloud
  },
  username: 'default',          // Add this line for Redis Cloud
  password: process.env.REDIS_PASSWORD,
});

// Log Redis connection status
client.on('connect', () => console.log('✅ Redis Client Connected'));
client.on('error', (err) => console.error('❌ Redis Client Error:', err));

// Connect the client
client.connect().catch(console.error);

// Default expiration time for cache
const DEFAULT_EXPIRATION = 3600; // 1 hour

exports.getOrSetCache = async (key, cb) => {
  try {
    const data = await client.get(key);
    if (data != null) return JSON.parse(data);

    const freshData = await cb();
    await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error('Redis cache error:', error);
    return cb();
  }
};

exports.invalidateCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
};

exports.client = client;
