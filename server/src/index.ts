import "./suppress-errors.js"; // MUST be first — registers handlers before any connections
import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./workers/generation.worker.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, health checks)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
  })
);
app.use(express.json());

app.use("/api/assignments", assignmentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
