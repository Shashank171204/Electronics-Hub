/**
 * CORS policy for the Electronics-Hub API.
 *
 * Why this file exists
 * --------------------
 * The browser blocks a cross-origin `fetch`/`axios` call unless the *server*
 * opts in via the `Access-Control-Allow-Origin` response header. The old
 * config was a bare `app.use(cors())`, which sends `*`. That looks permissive,
 * but `*` is rejected by browsers the moment a request carries credentials, and
 * it gives you no control over which sites may talk to your API.
 *
 * Here we keep an explicit allowlist: the deployed frontend origin plus local
 * dev origins, and we *reflect* the matched origin back (instead of `*`) so
 * `Access-Control-Allow-Credentials` stays valid.
 *
 * Configuration (Render → your backend service → Environment)
 * ------------------------------------------------------------
 *   CORS_ORIGINS   Comma-separated list of allowed browser origins.
 *                  e.g. https://electronics-hub-frontend.onrender.com
 *                  Falls back to CORS_ORIGIN, then FRONTEND_URL, so any of the
 *                  three names works.
 *                  Set it to `*` to allow any origin (handy for a public read
 *                  API; credentials are then automatically disabled).
 *
 * If nothing is configured we fall back to the known production frontend, so a
 * fresh clone / a Render service with no env vars still works out of the box.
 */
import cors from "cors";

/** Production frontend service on Render. */
export const PRODUCTION_FRONTEND_ORIGIN =
  "https://electronics-hub-frontend.onrender.com";

/**
 * Vite dev server (5173) and `vite preview` (4173) on both host spellings, so
 * `npm run dev` works from either http://localhost or http://127.0.0.1.
 */
export const LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

/**
 * Origins are compared without scheme-casing or a trailing slash, because
 * "https://foo.onrender.com/" and "https://foo.onrender.com" are the same
 * origin but humans paste both.
 */
const normalize = (origin) =>
  String(origin)
    .trim()
    .replace(/\/+$/, "")
    .toLowerCase();

/**
 * Build the allowlist from the environment.
 *
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Set<string> | "*"} "*" means "any origin".
 */
export function getAllowedOrigins(env = process.env) {
  const configured = (env.CORS_ORIGINS || env.CORS_ORIGIN || env.FRONTEND_URL || "")
    .split(",")
    .map(normalize)
    .filter(Boolean);

  if (configured.includes("*")) return "*";

  const isProduction = env.NODE_ENV === "production";
  const origins = [
    // The frontend that actually ships. Always allowed, even if someone also
    // sets CORS_ORIGINS — a forgotten env var should not take the site down.
    PRODUCTION_FRONTEND_ORIGIN,
    // Dev origins only outside production, so a public deployment never
    // accidentally trusts a localhost page.
    ...(isProduction ? [] : LOCAL_DEV_ORIGINS),
    ...configured,
  ];

  return new Set(origins.map(normalize));
}

/**
 * `cors` middleware options. Exported separately so it can be unit-tested
 * without booting Express.
 *
 * @param {NodeJS.ProcessEnv} [env]
 */
export function buildCorsOptions(env = process.env) {
  const allowed = getAllowedOrigins(env);
  const allowAnyOrigin = allowed === "*";

  return {
    /**
     * `origin` callback contract (see the `cors` package):
     *   callback(null, true)  → send Access-Control-Allow-Origin: <that origin>
     *   callback(null, false) → send no CORS header; the browser blocks it
     *   callback(new Error()) → 500
     *
     * We deliberately do NOT throw on a disallowed origin: responding without
     * the header is what a correct server does, and it keeps non-browser
     * clients (curl, health checks, server-to-server) working — those requests
     * simply carry no `Origin` header at all.
     */
    origin(origin, callback) {
      if (!origin) return callback(null, true); // no Origin header → not a browser CORS request
      if (allowAnyOrigin) return callback(null, true);
      if (allowed.has(normalize(origin))) return callback(null, true);

      console.warn(`[cors] blocked cross-origin request from ${origin}`);
      return callback(null, false);
    },

    // Safe with a reflected origin (never with a literal `*`, which is why we
    // reflect above instead of echoing the wildcard).
    credentials: !allowAnyOrigin,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    // `Content-Type` for JSON bodies, `Authorization` for when you add the
    // JWT login flow (the dep is already installed).
    allowedHeaders: ["Content-Type", "Authorization"],

    // Let the SPA read these if it ever needs to.
    exposedHeaders: ["Content-Length"],

    // Cache the preflight for 10 min so most calls skip the OPTIONS round-trip.
    maxAge: 600,

    // Express 5 handles OPTIONS fine with 204, but 200 is the defensive choice
    // for older proxies. Either is accepted by browsers.
    optionsSuccessStatus: 204,

    preflightContinue: false,
  };
}

/** Ready-to-mount middleware. */
export const corsMiddleware = () => cors(buildCorsOptions());

export default corsMiddleware;
