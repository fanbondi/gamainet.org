function normalizeEmailAddress(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function isSingleEmailAddress(value) {
  const normalized = normalizeEmailAddress(value);
  if (!normalized) return false;
  if (normalized.includes(',') || normalized.includes(';') || normalized.includes('\n') || normalized.includes('\r')) {
    return false;
  }

  const pattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;
  return pattern.test(normalized);
}

function createRateLimiter({ windowMs = 60_000, max = 3 } = {}) {
  const hits = new Map();

  return (key) => {
    const now = Date.now();
    const existing = hits.get(key) || { count: 0, expiresAt: now + windowMs };

    if (now > existing.expiresAt) {
      hits.set(key, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (existing.count >= max) {
      return false;
    }

    existing.count += 1;
    hits.set(key, existing);
    return true;
  };
}

module.exports = {
  normalizeEmailAddress,
  isSingleEmailAddress,
  createRateLimiter,
};
