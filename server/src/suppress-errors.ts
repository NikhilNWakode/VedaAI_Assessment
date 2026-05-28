// suppress-errors.ts
// Must be imported FIRST in index.ts (before redis/bullmq load)
// Catches ECONNRESET/EPIPE from BullMQ's internal IORedis connections
// that don't have error handlers attached.

process.on("uncaughtException", (err) => {
  const msg = err?.message || "";
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) return; // swallow
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  const msg = reason?.message || String(reason);
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) return; // swallow
  console.error("Unhandled rejection:", reason);
});
