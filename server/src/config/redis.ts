// redis.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Let IORedis parse the URL — it handles rediss://, special chars in
// passwords, etc. correctly. We just add BullMQ-required options.
function createConnection(label: string): IORedis {
  const conn = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 10000,
    connectTimeout: 15000,
    retryStrategy(times) {
      return Math.min(times * 500, 5000);
    },
    // IORedis auto-enables TLS for rediss:// URLs
  });

  conn.on("error", () => {}); // suppress reconnect noise

  // BullMQ calls .duplicate() internally — ensure copies also suppress errors
  const origDup = conn.duplicate.bind(conn);
  (conn as any).duplicate = (opts?: any) => {
    const dup = origDup(opts);
    dup.on("error", () => {});
    return dup;
  };

  console.log(`Redis [${label}] initialized`);
  return conn;
}

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
