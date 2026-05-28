// redis.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isTLS = redisUrl.startsWith("rediss://");

const baseOpts: Record<string, any> = {
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

/** Create an IORedis instance whose .duplicate() also suppresses errors */
function createConnection(label: string): IORedis {
  const conn = new IORedis(redisUrl, baseOpts);

  // Suppress error events on this instance
  conn.on("error", () => {});

  // BullMQ calls .duplicate() internally — patch it so the copy
  // also has an error handler (otherwise ECONNRESET crashes the process)
  const origDuplicate = conn.duplicate.bind(conn);
  (conn as any).duplicate = (overrides?: Record<string, any>) => {
    const dup = origDuplicate(overrides);
    dup.on("error", () => {});
    return dup;
  };

  console.log(`Redis [${label}] ready`);
  return conn;
}

export const redisConnection = createConnection("main");

export const generationQueue = new Queue("assessment-generation", {
  connection: createConnection("queue") as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export { createConnection };
