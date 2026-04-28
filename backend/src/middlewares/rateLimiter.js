const redis = require('../config/redis');

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 60; // saniye (1 dakika)

async function rateLimiter(req, res, next) {
  const ip = req.ip;
  const key = `rate_limit:${ip}`;

  try {
    const attempts = await redis.get(key);

    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        message: `Çok fazla başarısız giriş denemesi. ${ttl} saniye sonra tekrar deneyin.`,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter hatası:', err.message);
    next(); // Redis hata verse bile kullanıcıyı bloklama
  }
}

async function incrementAttempt(ip) {
  const key = `rate_limit:${ip}`;
  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, BLOCK_DURATION);
  }
}

async function resetAttempts(ip) {
  const key = `rate_limit:${ip}`;
  await redis.del(key);
}

module.exports = { rateLimiter, incrementAttempt, resetAttempts };