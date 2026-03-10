type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type FixedWindowOptions = {
  key: string;
  max: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const store = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function checkFixedWindowRateLimit({
  key,
  max,
  windowMs
}: FixedWindowOptions): RateLimitResult {
  const now = Date.now();
  pruneExpiredEntries(now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit: max,
      remaining: Math.max(0, max - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000)
    };
  }

  existing.count += 1;
  store.set(key, existing);

  const remaining = Math.max(0, max - existing.count);
  return {
    allowed: existing.count <= max,
    limit: max,
    remaining,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  };
}
