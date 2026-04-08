type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const current = buckets.get(key);
  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  return { allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}
