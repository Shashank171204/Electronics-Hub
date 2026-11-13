const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v, max = 200) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const email = (v) => text(v, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const positive = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;
const id = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const password = (v) => typeof v === "string" && v.length >= 8 && Buffer.byteLength(v, "utf8") <= 72;
const fail = (res, message) => res.status(400).json({ message });
const keys = (body, allowed) => Object.keys(body).every((key) => allowed.includes(key));

export const validateUser = (registration) => (req, res, next) => {
  const b = req.body;
  if (!object(b) || !keys(b, registration ? ["name", "email", "pass"] : ["email", "pass"]))
    return fail(res, "Invalid user fields");
  if (!email(b.email)) return fail(res, "A valid email is required");
  if (!password(b.pass)) return fail(res, "Password must be at least 8 characters and at most 72 UTF-8 bytes");
  if (registration && !text(b.name)) return fail(res, "Name is required (maximum 200 characters)");
  next();
};

export const validateProduct = (partial = false) => (req, res, next) => {
  const b = req.body;
  if (!object(b) || !Object.keys(b).length || !keys(b, ["name", "desc", "price", "url"]))
    return fail(res, "Only name, desc, price and url product fields are allowed");
  for (const key of ["name", "desc", "price", "url"]) {
    if (partial && !(key in b)) continue;
    if (key === "price" ? !positive(b[key]) : !text(b[key], key === "desc" ? 5000 : 2048))
      return fail(res, `${key} is required and must be ${key === "price" ? "a positive number" : "a non-empty string"}`);
  }
  if ("url" in b) {
    try { if (!["http:", "https:"].includes(new URL(b.url).protocol)) throw new Error(); }
    catch { return fail(res, "url must be an HTTP or HTTPS URL"); }
  }
  next();
};

export function validateId(req, res, next) {
  if (!id(req.params.id)) return fail(res, "Invalid product ID");
  next();
}

export function validateSearch(req, res, next) {
  if (!keys(req.query, ["q", "search"]) || Object.values(req.query).some((v) => typeof v !== "string" || v.length > 200))
    return fail(res, "Search must be a string of at most 200 characters");
  next();
}

export function validateOrder(req, res, next) {
  const b = req.body;
  if (!object(b) || !keys(b, ["email", "items", "total"])) return fail(res, "Invalid order fields");
  if (!email(b.email)) return fail(res, "A valid email is required");
  if (!positive(b.total)) return fail(res, "Order total must be a positive number");
  if (!object(b.items) || !Object.keys(b.items).length || Object.entries(b.items).some(([key, qty]) => !id(key) || !Number.isSafeInteger(qty) || qty <= 0))
    return fail(res, "Order items must be a non-empty product ID to positive integer quantity map");
  next();
}

export function validateOrderEmail(req, res, next) {
  if (!email(req.params.id)) return fail(res, "A valid email is required");
  next();
}
