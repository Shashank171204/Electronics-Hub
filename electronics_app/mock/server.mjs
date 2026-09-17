/**
 * Local in-memory mock of the Electronics-Hub backend.
 * Used for frontend development/preview without MongoDB.
 *
 *   node mock/server.mjs        →  listens on http://localhost:5001
 *
 * Emulates the same routes + response shapes as electronics_backend:
 *   GET  /api/product/showproducts
 *   POST /api/user/register
 *   POST /api/user/login
 *   POST /api/order/neworder
 *   GET  /api/order/showorder/:email
 *
 * Demo login: demo@hub.com / demo123
 * Zero dependencies — plain node:http.
 */
import http from "node:http";

const PORT = process.env.MOCK_PORT || 5001;

/* Inline SVG product art (gradient + emoji + label) as a data: URL,
   so images work without any external image host. */
const art = (emoji, from, to, label) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="640" fill="url(#g)"/>
      <circle cx="320" cy="290" r="155" fill="rgba(255,255,255,0.16)"/>
      <text x="320" y="345" font-size="170" text-anchor="middle">${emoji}</text>
      <text x="320" y="560" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="bold" fill="rgba(255,255,255,0.95)" text-anchor="middle">${label}</text>
    </svg>`
  );

let n = 1;
const _id = (p) => `${p}_${(n++).toString(36)}`;

const products = [
  { _id: _id("p"), name: "Aurora ANC Headphones", desc: "Over-ear wireless headphones with adaptive noise cancelling and 40h battery.", price: 12999, url: art("🎧", "#0ea5e9", "#6366f1", "Aurora ANC") },
  { _id: _id("p"), name: "Pulse Smartwatch X2", desc: "AMOLED always-on display, ECG + SpO2 tracking, 10-day battery, 5ATM.", price: 8499, url: art("⌚", "#8b5cf6", "#d946ef", "Pulse X2") },
  { _id: _id("p"), name: "Nimbus Ultrabook 14", desc: "14-inch 2.8K display, 16GB RAM, 1TB NVMe SSD, all-day battery in 1.2kg.", price: 72999, url: art("💻", "#06b6d4", "#3b82f6", "Nimbus 14") },
  { _id: _id("p"), name: "Boomer Blast Speaker", desc: "360° sound, 20W output, deep bass radiators and 18h of playtime.", price: 4999, url: art("🔊", "#f59e0b", "#ef4444", "Boomer Blast") },
  { _id: _id("p"), name: "Tactile Pro Keyboard", desc: "Hot-swappable mechanical keyboard with per-key RGB and PBT keycaps.", price: 6499, url: art("⌨️", "#10b981", "#06b6d4", "Tactile Pro") },
  { _id: _id("p"), name: "Viper 8K Gaming Mouse", desc: "8000Hz polling, 26K sensor, 58g weight, 6 programmable buttons.", price: 2999, url: art("🖱️", "#ef4444", "#8b5cf6", "Viper 8K") },
  { _id: _id("p"), name: "Skyhawk Mini Drone", desc: "4K gimbal camera, 34-min flight time, gesture control, obstacle sensing.", price: 45999, url: art("🚁", "#6366f1", "#0ea5e9", "Skyhawk") },
  { _id: _id("p"), name: "VoltCore 20K Power Bank", desc: "20,000mAh with 65W two-way fast charging and USB-C + USB-A ports.", price: 2499, url: art("🔋", "#22c55e", "#84cc16", "VoltCore 20K") },
];

const users = [
  { _id: "u_demo", name: "Demo User", email: "demo@hub.com", pass: "demo123" },
];

const orders = [];

const send = (res, status, body) => {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(data);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  console.log(`[mock] ${req.method} ${path}`);

  if (req.method === "OPTIONS") return send(res, 204, {});

  // GET /api/product/showproducts
  if (req.method === "GET" && path === "/api/product/showproducts") {
    return send(res, 200, products);
  }

  // POST /api/user/register (500 on duplicate email — like the mongoose error)
  if (req.method === "POST" && path === "/api/user/register") {
    const { name, email, pass } = await readBody(req);
    if (users.some((u) => u.email === email)) {
      return send(res, 500, { message: "Something went wrong" });
    }
    const doc = { _id: _id("u"), name, email, pass };
    users.push(doc);
    return send(res, 201, doc);
  }

  // POST /api/user/login
  if (req.method === "POST" && path === "/api/user/login") {
    const { email, pass } = await readBody(req);
    const doc = users.find((u) => u.email === email && u.pass === pass);
    if (doc) return send(res, 200, doc);
    return send(res, 401, { message: "Invalid credentials" });
  }

  // POST /api/order/neworder
  if (req.method === "POST" && path === "/api/order/neworder") {
    const body = await readBody(req);
    const doc = { _id: _id("o"), createdAt: new Date().toISOString(), ...body };
    orders.push(doc);
    return send(res, 200, doc);
  }

  // GET /api/order/showorder/:email
  if (req.method === "GET" && path.startsWith("/api/order/showorder/")) {
    const email = decodeURIComponent(path.split("/").pop());
    return send(res, 200, orders.filter((o) => o.email === email));
  }

  send(res, 404, { message: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mock] Electronics-Hub mock API on http://localhost:${PORT}`);
  console.log("[mock] demo login: demo@hub.com / demo123");
});
