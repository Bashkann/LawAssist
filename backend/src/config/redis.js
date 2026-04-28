const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis(env.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Redis bağlantısı başarılı.');
});

redis.on('error', (err) => {
  console.error('Redis bağlantı hatası:', err.message);
});

module.exports = redis;