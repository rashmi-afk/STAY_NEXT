const buckets = new Map();

const createRateLimit = ({
  windowMs = 60 * 1000,
  max = 60,
  message = "Too many requests. Please try again later.",
} = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.start > windowMs) {
      buckets.set(key, { count: 1, start: now });
      next();
      return;
    }

    if (bucket.count >= max) {
      return res.status(429).json({ message });
    }

    bucket.count += 1;
    next();
  };
};

module.exports = createRateLimit;
