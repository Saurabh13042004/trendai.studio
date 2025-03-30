const rateLimit = require('express-rate-limit');

// Basic IP-based rate limiting
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// More strict limiting for authentication routes
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per hour
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for image generation
exports.imageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 image generation requests per hour
  message: {
    success: false,
    message: 'Too many image generation requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for support ticket creation
exports.supportLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // limit each IP to 5 support tickets per day
  message: {
    success: false,
    message: 'You have reached the maximum number of support tickets for today'
  },
  standardHeaders: true,
  legacyHeaders: false
});