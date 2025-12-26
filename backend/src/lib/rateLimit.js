import redis from "./redis.js";

export async function msgRateLimit(userId, limit = 10, windowSeconds = 60) {
  const key = `ratelimit:messages:${userId}`;

  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const ttl = await redis.ttl(key);
    const resetIn = ttl > 0 ? ttl : windowSeconds;

    return {
      allowed,
      remaining,
      resetIn,
      current: count,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error.message);
    return {
      allowed: true,
      remaining: limit,
      resetIn: windowSeconds,
      current: 0,
    };
  }
}
