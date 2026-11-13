import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get("Authorization") || "");
  if (!match) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
    if (!payload || typeof payload.id !== "string" || typeof payload.email !== "string" ||
        !["user", "admin"].includes(payload.role)) throw new Error("Invalid claims");
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Forbidden: admin access required" });
  next();
}

export function requireOrderOwner(req, res, next) {
  const email = req.method === "GET" ? req.params.id : req.body.email;
  if (req.user.role !== "admin" && email !== req.user.email) {
    return res.status(403).json({ message: "Forbidden: orders must belong to your account" });
  }
  next();
}
