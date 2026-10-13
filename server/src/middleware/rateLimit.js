const requestCounts = new Map();

// shortcut: in-memory rate limiting resets on restart, upgrade to distributed Redis limiter if multi-instance
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 50, message = 'Too many requests, please try again later' } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'global';
    const now = Date.now();
    const record = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(key, record);

    if (record.count > max) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message
        }
      });
    }

    next();
  };
}
