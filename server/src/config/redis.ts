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

/** Create a new IORedis instance with error suppression built in */
function createConnection(label: string): IORedis {
  const conn = new IORedis(redisUrl, baseOpts);
  conn.on("error", () => {}); // suppress reconnect noise
  conn.on("connect", () => console.log(`Redis [${label}] connected`));
  return conn;
}

// Each BullMQ Queue/Worker needs its own connection (they call .duplicate() internally)
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

// Export factory for the worker to create its own connection
export { createConnection };
