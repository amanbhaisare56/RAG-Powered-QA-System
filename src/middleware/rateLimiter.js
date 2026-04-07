const rateLimit = require('express-rate-limit');

const askRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    if (req.user?.userId) return req.user.userId.toString();
    return 'anonymous';
  },
  validate: { ip: false },
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests. You are limited to 10 questions per minute.',
      retryAfter: '60 seconds',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { askRateLimiter };