// suppress-errors.ts
// Must be imported FIRST in index.ts before anything else.
//
// Upstash free tier aggressively drops idle TCP connections.
// ioredis/BullMQ reconnect fine, but error messages leak to stderr
// from Node's internal TCP layer before any JS-level handler can catch them.
// This intercepts stderr to filter out the harmless reconnect noise.

const origWrite = process.stderr.write.bind(process.stderr);

process.stderr.write = ((chunk: any, encodingOrCb?: any, cb?: any): boolean => {
  const str = typeof chunk === "string" ? chunk : chunk.toString();
  if (str.includes("ECONNRESET") || str.includes("EPIPE")) return true;
  return origWrite(chunk, encodingOrCb, cb);
}) as typeof process.stderr.write;

// Safety net for anything that slips through as an exception
process.on("uncaughtException", (err) => {
  const msg = err?.message || "";
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) return;
  console.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  const msg = reason?.message || String(reason);
  if (msg.includes("ECONNRESET") || msg.includes("EPIPE")) return;
  console.error("Unhandled rejection:", reason);
});
