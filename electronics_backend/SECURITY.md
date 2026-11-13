# Authentication deployment and testing

## Deploy safely

- Set **JWT_SECRET** on the Render backend before deploying. Generate a random
  value with `openssl rand -hex 32`; at least 32 characters are required at startup.
  Never put the real value in Git or a `VITE_*` variable. Tokens expire in 7 days;
  changing the secret revokes all existing tokens.
- Keep existing `MONGO_URI` and CORS settings. Authorization is already permitted
  by the CORS configuration. No new frontend environment variable is required.
- Existing plaintext passwords are **not** accepted. Arrange a secure password
  reset or controlled offline bcrypt migration before rollout. Do not implement a
  public plaintext-login fallback. This patch does not include a password-reset flow.
- Audit existing users for duplicate emails before deploying the unique email
  index; resolve duplicates and ensure the index is created in MongoDB (especially
  if production disables Mongoose auto-indexing).
- Registration always creates a `user`; it cannot accept a role. Promote admins
  only through trusted database administration, then log in again for a new token.
  Roles are token snapshots: demotion takes effect on token expiration, or revoke
  all tokens by rotating JWT_SECRET if immediate revocation is required.
- Frontend stores token/profile in tab-scoped sessionStorage and clears both on
  logout. Passwords are not persisted. Storage is JavaScript-accessible, so XSS
  prevention remains important; logout does not revoke a previously copied JWT.

## Contract

Existing route paths and success bodies are retained. User responses omit `pass`;
login adds a top-level `token`. Send `Authorization: Bearer <token>` on protected
requests. Errors use `{ "message": "..." }`: 400 invalid input, 401 missing/invalid/
expired token or bad credentials, 403 insufficient role/order ownership, 409 email
already registered.

Passwords require at least 8 characters and at most 72 UTF-8 bytes (bcrypt limit).
Product writes allow only name, desc, positive numeric price and HTTP(S) url;
PATCH accepts a non-empty subset. Order items retain the cart's map shape:
`{ "<24-character product ObjectId>": <positive integer quantity> }`.
Order totals must be positive JSON numbers. Empty/zero-quantity items are rejected;
the frontend strips removed cart entries before submitting. This validates total
shape, **not** authoritative catalog pricing/payment settlement; never use a
client-supplied total as the payment amount without server-side repricing.

## Automated checks

```sh
npm ci --prefix electronics_backend
npm test --prefix electronics_backend
npm run check --prefix electronics_backend
npm ci --prefix electronics_app
npm run build --prefix electronics_app
npm run lint --prefix electronics_app
```

Backend tests exercise the real Express routes with mocked Mongoose operations;
they do not require MongoDB. Verify index creation and persistence against a
staging database before production rollout.

## Manual smoke test (staging)

```sh
API=https://your-backend.onrender.com
curl -i "$API/api/user/register" -H 'Content-Type: application/json' \
  -d '{"name":"Test Buyer","email":"buyer@example.com","pass":"a-long-test-password"}'
curl -i "$API/api/user/login" -H 'Content-Type: application/json' \
  -d '{"email":"buyer@example.com","pass":"a-long-test-password"}'
# Copy the top-level token from login:
TOKEN='<login token>'
curl -i "$API/api/order/showorder/buyer@example.com" -H "Authorization: Bearer $TOKEN"
curl -i "$API/api/order/showorder/other@example.com" -H "Authorization: Bearer $TOKEN"
curl -i "$API/api/product/createproduct" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","desc":"Test product","price":10,"url":"https://example.com/test.jpg"}'
```

Expected: registration 201 without pass; login 200 without pass and with token;
own order lookup 200; other user's lookup 403; normal user's product creation 403.
Repeat product creation with a newly logged-in admin: expect 200. Delete that test
product using `/api/product/deleteproduct/:id`. Without Authorization, all product
writes and order endpoints return 401; public `/showproducts` and `/search` under
`/api/product` remain accessible. Negative prices/totals, invalid emails, short
passwords and empty items produce 400 with a clear message.
