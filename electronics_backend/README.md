# Electronics Hub — Backend

Express 5 + Mongoose API for the storefront. Deployed on Render at
**https://electronics-hub.onrender.com**.

```
index.js               # bootstrap: dotenv → listen → connect Mongo (with retries) → graceful shutdown
app.js                 # the Express app: cors → json → /api/health → routes → 404 → error handler
config/cors.js         # the browser-origin allowlist (see below)
routes/                # /api/user, /api/product, /api/order
controllers/           # mongoose queries
models/                # user / product / order schemas
.env.example           # copy to .env
```

## Run it

```bash
cp .env.example .env    # add your MONGO_URI
npm install
npm run dev             # nodemon, http://localhost:5001
```

`PORT` comes from Render; locally it defaults to **5001**, which is what the
frontend and `electronics_app/vite.config.js` expect.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB Atlas connection string |
| `PORT` | on Render | Render injects it; the app binds `0.0.0.0:$PORT` |
| `CORS_ORIGINS` | no | comma-separated browser origins allowed to call this API |
| `NODE_ENV` | recommended | `production` drops the localhost dev origins from the allowlist |

## CORS

`config/cors.js` builds an allowlist and **reflects** the matched origin back
(`Access-Control-Allow-Origin: <origin>` + `Access-Control-Allow-Credentials: true`).
Reflecting instead of sending `*` is what keeps credentialed requests valid —
browsers reject `*` the moment credentials are involved.

Always allowed:

- `https://electronics-hub-frontend.onrender.com` — the deployed frontend, hardcoded
  so a missing env var can never take the site down
- `http://localhost:5173` / `:4173` (and `127.0.0.1`) — Vite dev + preview, skipped
  when `NODE_ENV=production`

Requests with **no `Origin` header** (curl, `gh`, Render's health check,
server-to-server) are never blocked — CORS is a browser mechanism only.

Add another frontend (staging, a preview deploy) without touching code:

```
CORS_ORIGINS=https://staging-electronics-hub.onrender.com,https://electronics-hub-frontend.onrender.com
```

To open the read endpoints to the whole internet, set `CORS_ORIGINS=*`; the
allowlist then falls back to reflecting any origin with credentials disabled.

## Health check

```bash
curl -i -H "Origin: https://electronics-hub-frontend.onrender.com" \
     https://electronics-hub.onrender.com/api/health
# { "status": "ok", "db": "connected", "uptime": 12 }
```

Answers even while MongoDB is still connecting (`"db": "disconnected"`), so a DB
problem looks like a DB problem instead of a dead service. Good target for
Render's health-check path.

## Notes

- The HTTP server starts **before** MongoDB finishes connecting, and a DB failure
  exits the process after 5 attempts so Render's log shows the real reason
  rather than serving 500s silently forever.
- Unmatched paths return JSON (`404 {"message":"No route for GET /…"}`), never
  the SPA's `index.html` — that HTML-in-JSON mixup is what made the original
  production breakage so misleading.
