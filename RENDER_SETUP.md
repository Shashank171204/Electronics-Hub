# Wiring the two Render services together

Frontend: **https://electronics-hub-frontend.onrender.com** (Vite SPA)
Backend:  **https://electronics-hub.onrender.com** (Express + MongoDB Atlas)

## Why it was broken

Two independent things had to line up, and neither did:

1. **The SPA was calling itself.** Every component built URLs as
   `` `${import.meta.env.VITE_API_URL ?? ""}/api/...` ``. No `.env` existed and
   Render had no `VITE_API_URL`, so that resolved to `""` and the deployed app
   requested `https://electronics-hub-frontend.onrender.com/api/...` — the
   static frontend host, which has no `/api` routes. The browser reported that
   as a CORS/JSON failure, but the server was never even reached.
   Vite `VITE_*` variables are **build-time**: they are baked into the JS bundle,
   so a runtime-only env var on Render does nothing.
2. **`cors()` with no options.** `Access-Control-Allow-Origin: *` cannot be
   combined with credentialed requests and tells you nothing about which origins
   you intended to trust.

## How it works now

| Layer | File | Behaviour |
| --- | --- | --- |
| API base URL | `electronics_app/src/lib/api.js` | `VITE_API_URL` → else `http://localhost:5001` in dev → else `https://electronics-hub.onrender.com` in a production build |
| Axios instance | `electronics_app/src/lib/api.js` | one `api` client with `baseURL`; components pass root-relative paths (`/api/...`) via `endpoints` |
| CORS | `electronics_backend/config/cors.js` | allowlist from `CORS_ORIGINS`, always including the production frontend; dev origins allowed unless `NODE_ENV=production`; origin is reflected (not `*`) so `credentials` stays valid |
| App assembly | `electronics_backend/app.js` | CORS → JSON body parser → `/api/health` → routes → 404 → error handler |
| Bootstrap | `electronics_backend/index.js` | `dotenv` → listen on `PORT` (default 5001) → connect Mongo with retries → graceful shutdown |

The production URL is the **fallback**, not the only path: a fresh `npm run build`
works on Render with zero configuration, while `VITE_API_URL` still overrides it
for staging or a preview deploy.

## Render setup

**Backend service** → Environment:

```
MONGO_URI=mongodb+srv://…
CORS_ORIGINS=https://electronics-hub-frontend.onrender.com
```

(`PORT` is injected by Render; the app also defaults to `5001` locally.)

**Frontend service** → Environment Variables. Vite reads them while it builds, so
the value must exist before `npm run build` runs on Render (it does — that tab
feeds the build step); then deploy:

```
VITE_API_URL=https://electronics-hub.onrender.com
```

Also confirm the frontend's Build command is `npm run build` and the output
directory is `dist`. Because the URL is the fallback in `src/lib/api.js`, an
already-green deployment does not need this step at all.

## Verifying

```bash
# 1. Is the API up, and does it accept the frontend origin?
curl -i -H "Origin: https://electronics-hub-frontend.onrender.com" \
     https://electronics-hub.onrender.com/api/health
#    → 200, and: access-control-allow-origin: https://electronics-hub-frontend.onrender.com

# 2. Is the preflight answered?
curl -i -X OPTIONS \
     -H "Origin: https://electronics-hub-frontend.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: content-type" \
     https://electronics-hub.onrender.com/api/order/neworder
#    → 204 + allow-origin + allow-methods + max-age

# 3. Did the SPA actually get the right URL baked into the bundle?
npm run build
grep -o "https://electronics-hub.onrender.com" dist/assets/*.js | sort -u
#    → the production backend URL must appear; if it doesn't, VITE_API_URL was
#      wrong (or the deploy ran a cached build).

```

If the browser console says `blocked by CORS policy` but step 1 shows the header,
compare the `Origin` in the request with the allowlist — a trailing slash or an
`http://` vs `https://` mismatch is the usual culprit.

## Local development

```bash
# terminal 1 — real API (needs MONGO_URI in electronics_backend/.env)
npm run dev                      # http://localhost:5001

# terminal 1 (alternative) — in-memory mock, no MongoDB required
node mock/server.mjs             # same endpoints, also on :5001

# terminal 2
npm run dev                      # http://localhost:5173
```

`vite.config.js` still proxies `/api` → `:5001` as an escape hatch: run the
browser through the dev server's same-origin path if you ever want to bypass
CORS locally.
