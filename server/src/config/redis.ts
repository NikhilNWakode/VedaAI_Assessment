// redis.ts
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Parse Redis URL into IORedis-compatible options so BullMQ manages
// all connections internally (no orphan sockets throwing ECONNRESET)
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  const isTLS = parsed.protocol === "rediss:";
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 10000,
    connectTimeout: 15000,
    retryStrategy(times: number) {
      return Math.min(times * 500, 5000);
    },
    ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
  };
}

export const redisConnectionOpts = parseRedisUrl(redisUrl);

export const generationQueue = new Queue("assessment-generation", {
  connection: redisConnectionOpts as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

console.log(`Redis configured → ${redisConnectionOpts.host}:${redisConnectionOpts.port} (TLS: ${"tls" in redisConnectionOpts})`);

// Log queue events
generationQueue.on("error", (err) => {
  console.error("Queue error:", err.message);
});

