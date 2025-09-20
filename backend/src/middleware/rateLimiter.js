// Rate limiting middleware
const rateLimit = require('express-rate-limit');

// Create rate limiter
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

// Strict rate limiter for generation endpoints
const generationLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  5 // 5 requests per 5 minutes
);

module.exports = {
  apiLimiter,
  generationLimiter
};