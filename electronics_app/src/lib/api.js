/**
 * The one place that decides where API requests go.
 *
 * Every component used to do its own
 *   const API = import.meta.env.VITE_API_URL ?? "";
 *   axios.get(`${API}/api/product/showproducts`)
 * and that `?? ""` is exactly what broke production: with no `VITE_API_URL`
 * baked into the build, `API` was an empty string, so the deployed SPA called
 * *itself* (https://electronics-hub-frontend.onrender.com/api/…) and got back
 * the SPA's 404/index.html instead of JSON.
 *
 * Resolution order
 * ----------------
 * 1. `VITE_API_URL`      — explicit override, wins in any mode.
 * 2. dev (`npm run dev`) — same-origin /api, proxied by Vite to port 5001.
 * 3. build (`npm run build`) — the Render backend URL.
 *
 * So a production deploy works with zero configuration, while still being
 * overridable per-environment.
 *
 * ⚠️ Vite inlines `import.meta.env.VITE_*` at BUILD time — the value becomes a
 * string literal inside the JS bundle. So on Render the variable has to exist
 * *while `npm run build` runs* (Environment tab of the frontend service), and
 * every change needs a fresh deploy to take effect. Flipping it at runtime only
 * changes the container's env, which the already-built bundle never reads.
 */
import axios from "axios";

/** Same-origin requests use the Vite /api proxy during development. */
export const DEV_API_URL = "";

/** Backend service on Render. */
export const PROD_API_URL = "https://electronics-hub.onrender.com";

/**
 * @returns {string} absolute origin, no trailing slash ("" = same-origin).
 */
export function resolveApiBaseUrl() {
  const fromEnv = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  // `import.meta.env.DEV` is true for `vite dev`/`vite serve`, false for
  // `vite build` — no hostname sniffing, no runtime env var needed.
  return import.meta.env.DEV ? DEV_API_URL : PROD_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Shared axios instance. `baseURL` is joined with the leading-slash paths the
 * components pass in (axios handles `baseURL + '/api/...'` correctly, unlike
 * hand-rolled string templates that double up slashes).
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

// Keep the token for this tab only; never persist passwords.
export function clearAuth() {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("authUser");
}

export function getStoredUser() {
  try {
    return sessionStorage.getItem("authToken")
      ? JSON.parse(sessionStorage.getItem("authUser") || "{}") : {};
  } catch { return {}; }
}

export function saveAuth(data) {
  const { token, ...profile } = data;
  delete profile.pass;
  delete profile.password;
  sessionStorage.setItem("authToken", token);
  sessionStorage.setItem("authUser", JSON.stringify(profile));
  return profile;
}

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log the resolved target once per page load. In production this is the single
// most useful line in DevTools when a request fails: it tells you instantly
// whether the build got the right URL baked in.
if (import.meta.env.DEV) {
  console.info(`[api] baseURL → ${API_BASE_URL}`);
}

/**
 * Human-readable failure message for a thrown request error — used by the
 * toasts, so that a CORS/network failure and a 500 are not both
 * "Something went wrong".
 *
 * The important distinction for this app's most common production bug:
 *   • a *response* arrived  → the API is reachable, something downstream is wrong
 *   • NO response at all    → the request never completed: CORS blocked it, the
 *                             origin is wrong, or the free-tier backend is asleep
 *
 * @param {unknown} err
 * @returns {string}
 */
export function describeApiError(err) {
  const status = err?.response?.status;
  if (status) {
    if (status === 401) return err.response.data?.message || "Please log in again";
    if (status === 403) return err.response.data?.message || "You do not have permission";
    if (status === 404) return "Endpoint not found on the API";
    return err.response.data?.message || `Request failed (${status})`;
  }
  if (err?.code === "ECONNABORTED" || err?.name === "AbortError") {
    return "The API took too long to respond";
  }
  // axios reports ERR_NETWORK / "Network Error" here; a fetch() rejection or an
  // SSR connect failure has no `response` either, which is the real signal.
  return `Couldn't reach the API at ${API_BASE_URL} — CORS may be blocking it, or the backend is down/asleep`;
}

/** All API calls are relative to `api.defaults.baseURL`. */
export const endpoints = {
  products: "/api/product/showproducts",
  searchProducts: (q) => `/api/product/search?q=${encodeURIComponent(q)}`,
  register: "/api/user/register",
  login: "/api/user/login",
  newOrder: "/api/order/neworder",
  ordersFor: (email) => `/api/order/showorder/${encodeURIComponent(email)}`,
};

export default api;
