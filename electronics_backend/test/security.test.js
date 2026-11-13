import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createApp } from "../app.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

process.env.JWT_SECRET = "test-only-secret-with-at-least-32-characters";

test("security routes enforce hashing, JWT, roles, ownership and validation before persistence", async (t) => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, method = "GET", body, token) => {
    const response = await fetch(base + path, {
      method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, data: await response.json() };
  };
  let stored;
  t.mock.method(User, "exists", async () => null);
  t.mock.method(User, "create", async (body) => { stored = new User(body); return stored; });
  t.mock.method(User, "findOne", () => ({ select: async () => stored }));
  t.mock.method(Product, "find", async () => []);
  t.mock.method(Product, "create", async (body) => body);
  t.mock.method(Product, "findByIdAndUpdate", async () => ({ name: "updated" }));
  t.mock.method(Product, "findByIdAndDelete", async () => ({ name: "deleted" }));
  t.mock.method(Order, "create", async (body) => body);
  t.mock.method(Order, "find", async () => []);
  const user = { name: "Buyer", email: "buyer@example.com", pass: "safe-password" };
  const registration = await request("/api/user/register", "POST", user);
  assert.equal(registration.status, 201);
  assert.equal(registration.data.pass, undefined);
  assert.notEqual(stored.pass, user.pass);
  assert.equal(await bcrypt.compare(user.pass, stored.pass), true);
  assert.equal(bcrypt.getRounds(stored.pass), 12);
  assert.equal((await request("/api/user/register", "POST", { ...user, role: "admin" })).status, 400);
  assert.equal((await request("/api/user/register", "POST", { ...user, pass: "short" })).status, 400);
  assert.equal((await request("/api/user/login", "POST", { email: { $ne: "" }, pass: user.pass })).status, 400);
  assert.equal((await request("/api/user/login", "POST", { email: user.email, pass: "wrong-password" })).status, 401);
  const login = await request("/api/user/login", "POST", { email: user.email, pass: user.pass });
  assert.equal(login.status, 200);
  assert.equal(login.data.pass, undefined);
  const token = login.data.token;
  const claims = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(claims.role, "user");
  assert.equal(claims.exp - claims.iat, 7 * 24 * 60 * 60);
  const admin = jwt.sign({ id: String(stored._id), email: user.email, role: "admin" }, process.env.JWT_SECRET);
  const expired = jwt.sign({ id: String(stored._id), email: user.email, role: "user" }, process.env.JWT_SECRET, { expiresIn: -1 });
  const id = "507f1f77bcf86cd799439011";
  const product = { name: "Phone", desc: "Example", price: 100, url: "https://example.com/phone.jpg" };
  for (const [path, method, body] of [
    ["/api/product/createproduct", "POST", product],
    [`/api/product/updateproduct/${id}`, "PATCH", { price: 50 }],
    [`/api/product/deleteproduct/${id}`, "DELETE", undefined],
  ]) {
    assert.equal((await request(path, method, body)).status, 401);
    assert.equal((await request(path, method, body, token)).status, 403);
    assert.equal((await request(path, method, body, admin)).status, 200);
  }
  assert.equal((await request("/api/product/createproduct", "POST", { ...product, price: -1 }, admin)).status, 400);
  assert.equal((await request(`/api/product/updateproduct/${id}`, "PATCH", { $set: { price: 1 } }, admin)).status, 400);
  assert.equal((await request("/api/product/deleteproduct/bad-id", "DELETE", undefined, admin)).status, 400);
  assert.equal((await request("/api/product/search?q=%5B")).status, 200);
  assert.equal((await request("/api/product/search?q[x]=bad")).status, 400);
  assert.equal((await request("/api/product/showproducts")).status, 200);
  const order = { email: user.email, items: { [id]: 1 }, total: 100 };
  for (const invalid of [undefined, "bad-token", expired]) {
    assert.equal((await request("/api/order/neworder", "POST", order, invalid)).status, 401);
    assert.equal((await request(`/api/order/showorder/${user.email}`, "GET", undefined, invalid)).status, 401);
  }
  assert.equal((await request("/api/order/neworder", "POST", order, token)).status, 201);
  assert.equal((await request("/api/order/neworder", "POST", { ...order, email: "other@example.com" }, token)).status, 403);
  assert.equal((await request("/api/order/neworder", "POST", { ...order, email: "other@example.com" }, admin)).status, 201);
  for (const changes of [{ items: {} }, { items: { [id]: 0 } }, { total: 0 }, { total: "100" }]) {
    assert.equal((await request("/api/order/neworder", "POST", { ...order, ...changes }, token)).status, 400);
  }
  assert.equal((await request(`/api/order/showorder/${user.email}`, "GET", undefined, token)).status, 200);
  assert.equal((await request("/api/order/showorder/other@example.com", "GET", undefined, token)).status, 403);
  assert.equal((await request("/api/order/showorder/other@example.com", "GET", undefined, admin)).status, 200);
  // Existing plaintext records are deliberately not authenticated.
  stored.pass = user.pass;
  assert.equal((await request("/api/user/login", "POST", { email: user.email, pass: user.pass })).status, 401);
});
