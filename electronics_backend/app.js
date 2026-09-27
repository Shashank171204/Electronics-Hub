/**
 * Express app (no listening socket here — see index.js).
 *
 * Splitting the app out of index.js means it can be imported by a test or a
 * mock server without opening a port or needing a live MongoDB connection.
 */
import express from "express";
import mongoose from "mongoose";
import { corsMiddleware } from "./config/cors.js";
import userRoute from "./routes/userRoute.js";
import productRoute from "./routes/productRoute.js";
import orderRoute from "./routes/orderRoute.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Render terminates TLS at its edge proxy, so req.secure / req.ip only make
  // sense once we trust that proxy hop.
  app.set("trust proxy", 1);

  // 1. CORS MUST come before body parsing and before the routes, so that
  //    preflight (OPTIONS) requests are answered even for endpoints that would
  //    otherwise reject them.
  app.use(corsMiddleware());

  // 2. JSON bodies
  app.use(express.json({ limit: "1mb" }));

  // 3. Health check — no DB write, so it answers even while Mongo is still
  //    connecting. Point Render's health check here, and use it to confirm
  //    CORS from the terminal:
  //      curl -i -H "Origin: https://electronics-hub-frontend.onrender.com" \
  //           https://electronics-hub.onrender.com/api/health
  app.get(["/api/health", "/health"], (_req, res) => {
    res.status(200).json({
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptime: Math.round(process.uptime()),
    });
  });

  // 4. Feature routes
  app.use("/api/user", userRoute);
  app.use("/api/product", productRoute);
  app.use("/api/order", orderRoute);

  // 5. Anything else is a typo'd path — say so explicitly instead of silently
  //    serving the SPA's index.html (which is what makes an API 404 so painful
  //    to debug: axios gets HTML and dies in JSON.parse).
  app.use((req, res) => {
    res.status(404).json({
      message: `No route for ${req.method} ${req.originalUrl}`,
      hint: "Endpoints live under /api/user, /api/product and /api/order.",
    });
  });

  // 6. Central error handler, so a thrown controller error becomes a JSON 500
  //    rather than a hanging request.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[api]", err);
    res.status(err.status || 500).json({
      message: err.expose ? err.message : "Something went wrong",
    });
  });

  return app;
}

export default createApp;
