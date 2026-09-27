/**
 * Server bootstrap: load env → mount the app → connect Mongo → listen.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { buildCorsOptions, getAllowedOrigins } from "./config/cors.js";

// Must run before createApp()/buildCorsOptions(), which read process.env.
dotenv.config();

// Render injects PORT; locally fall back to 5001, which is also what
// electronics_app/vite.config.js proxies to and what mock/server.mjs uses.
const PORT = Number(process.env.PORT) || 5001;
const HOST = "0.0.0.0"; // binding to 127.0.0.1/localhost would make Render 502

const MONGO_URI = process.env.MONGO_URI;
const DB_RETRIES = 5;
const DB_RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectDatabase(uri, attempt = 1) {
  if (!uri) {
    console.warn(
      "[db] MONGO_URI is not set — the API will start, but every request that " +
        "touches the database will fail."
    );
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
    console.log("[db] MongoDB connected");
  } catch (err) {
    console.error(`[db] connection attempt ${attempt}/${DB_RETRIES} failed:`, err.message);
    if (attempt >= DB_RETRIES) {
      // Exit so Render surfaces the failure in the service log / restarts
      // instead of leaving a zombie process serving 500s forever.
      process.exit(1);
    }
    await sleep(DB_RETRY_DELAY_MS * attempt);
    return connectDatabase(uri, attempt + 1);
  }
}

const app = createApp();

// Start listening first. If Mongo is slow or down we still answer /api/health
// (with db: "disconnected") instead of an opaque "application error", which is
// the difference between a 60-second diagnosis and a 60-minute one.
const server = app.listen(PORT, HOST, () => {
  const allowed = getAllowedOrigins();
  console.log(`Server is running on port ${PORT}`);
  console.log(
    "[cors] allowed origins:",
    allowed === "*" ? "* (any origin)" : [...allowed].join(", ")
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n[shutdown] ${signal} received, closing server`);
    server.close(() => process.exit(0));
    mongoose.connection.readyState === 1 && mongoose.disconnect();
  });
}

await connectDatabase(MONGO_URI);
