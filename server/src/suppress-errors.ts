// suppress-errors.ts — imported first in index.ts

// Catch uncaught exceptions so the process doesn't crash on Redis reconnects
process.on("uncaughtException", (err) => {
  const msg = err?.message || "";
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) {
    // Log once briefly instead of full stack trace
    console.warn(`[redis-reconnect] ${(err as any).code || msg}`);
    return;
  }
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  const msg = reason?.message || String(reason);
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) return;
  console.error("Unhandled rejection:", reason);
});
