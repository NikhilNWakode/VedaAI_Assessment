// redis.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isTLS = redisUrl.startsWith("rediss://");

// Shared connection options — resilient to Upstash free-tier idle disconnects
const redisOpts: Record<string, any> = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 10000,
  connectTimeout: 15000,
  retryStrategy(times: number) {
    return Math.min(times * 500, 5000); // back off up to 5s
  },
  reconnectOnError(err: Error) {
    // Reconnect on connection-reset errors
    return err.message.includes("ECONNRESET") || err.message.includes("EPIPE");
  },
  ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
};

export const redisConnection = new IORedis(redisUrl, redisOpts);

let loggedOnce = false;
redisConnection.on("connect", () => {
  if (!loggedOnce) {
    console.log("Redis connected");
    loggedOnce = true;
  }
});

redisConnection.on("error", (err) => {
  // Suppress noisy reconnect errors, only log unexpected ones
  if (!err.message.includes("ECONNRESET") && !err.message.includes("EPIPE")) {
    console.error("Redis error:", err.message);
  }
});

// Cast to `any` to avoid ioredis version mismatch with bullmq's bundled copy
export const generationQueue = new Queue("assessment-generation", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
