// redis.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  // Upstash and other cloud Redis providers use rediss:// (TLS)
  ...(redisUrl.startsWith("rediss://") ? { tls: { rejectUnauthorized: false } } : {}),
});

redisConnection.on("connect", () => {
console.log("Redis connected");
});

redisConnection.on("error", (err) => {
console.error("Redis error:", err);
});

export const generationQueue = new Queue("assessment-generation", {
connection: redisConnection,
defaultJobOptions: {
attempts: 3,
backoff: {
type: "exponential",
delay: 2000,
},
},
});
