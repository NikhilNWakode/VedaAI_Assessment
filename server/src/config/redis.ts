// redis.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isTLS = redisUrl.startsWith("rediss://");

// Connection options shared by all Redis connections (ours + BullMQ's internal ones)
export const redisOpts: Record<string, any> = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  connectTimeout: 15000,
  retryStrategy(times: number) {
    return Math.min(times * 500, 5000);
  },
  reconnectOnError(err: Error) {
    return err.message.includes("ECONNRESET") || err.message.includes("EPIPE");
  },
  ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
};

// Single shared connection for our own use
export const redisConnection = new IORedis(redisUrl, redisOpts);

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

// Silently handle reconnect noise
redisConnection.on("error", () => {});

// BullMQ Queue — pass URL + options so BullMQ creates its own managed connections
export const generationQueue = new Queue("assessment-generation", {
  connection: {
    url: redisUrl,
    ...redisOpts,
  } as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
