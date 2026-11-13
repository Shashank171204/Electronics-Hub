# Electronics Hub

**A full-stack MERN storefront for discovering electronics and managing orders.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?logo=render&logoColor=white)](https://electronics-hub-frontend.onrender.com)
[![Stack](https://img.shields.io/badge/Stack-MERN-61DAFB)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-22.12%2B-339933?logo=nodedotjs&logoColor=white)](#prerequisites)

[Live application](https://electronics-hub-frontend.onrender.com) · [Backend health](https://electronics-hub.onrender.com/api/health) · [Security guide](electronics_backend/SECURITY.md)

> **Project status:** Frontend and backend are configured for deployment on Render. No automated CI workflow is currently included, so no passing-build badge is claimed. See [Checks and builds](#checks-and-builds) for local verification.

## Overview

Electronics Hub combines an animated, responsive React storefront with an Express API and MongoDB Atlas persistence. The monorepo keeps frontend and backend dependencies, configuration, and deployment settings separate.

### Core features

- **User authentication:** Registration with bcrypt password hashing (12 rounds), JWT login with a seven-day expiration, and password-free user responses.
- **Product discovery:** Public catalog and live, API-backed search across product names and descriptions as you type on the catalog page.
- **Shopping cart:** Quantity controls, item removal, and calculated order totals.
- **Order management:** Authenticated order placement and order history, restricted to the account's email unless the caller is an admin.
- **Role-based API access:** Product creation, updates, and deletion require an admin token; product reads remain public.
- **Backend validation:** Clear JSON errors for invalid credentials, fields, prices, totals, product IDs, and order items.
- **Polished interface:** Tailwind CSS styling, Framer Motion transitions, loading states, and toast notifications.

> This project manages orders, not payment processing. Submitted totals are validated as positive numbers but are not recalculated against catalog prices on the server. Add authoritative server-side pricing before accepting payments.

## Tech stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, Framer Motion, React Router, Axios, Lucide icons, React Hot Toast.
- **Backend:** Node.js, Express 5, Mongoose, bcrypt, JSON Web Tokens (`jsonwebtoken`), dotenv, CORS, nodemon.
- **Database:** MongoDB Atlas.
- **Hosting:** Render Web Service for the API and Render Static Site for the frontend.
- **Checks:** Node.js built-in test runner, backend syntax checks, ESLint, and Vite production builds.

## Project structure

```text
Electronics-Hub/
├── README.md
├── RENDER_SETUP.md               # Additional Render/CORS troubleshooting
├── electronics_app/              # Frontend — independent npm package
│   ├── public/
│   ├── src/
│   │   ├── components/           # Catalog, auth, cart, orders, reusable UI
│   │   ├── lib/api.js            # Axios client, API URLs, token interceptor
│   │   ├── App.jsx               # Routes and shared application state
│   │   └── main.jsx
│   ├── mock/                     # Optional development mock API
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js            # React, Tailwind, and local API proxy
└── electronics_backend/          # Backend — independent npm package
    ├── config/                   # CORS policy
    ├── controllers/              # User, product, and order handlers
    ├── middleware/               # JWT, role/ownership checks, validation
    ├── models/                   # Mongoose schemas
    ├── routes/                   # Express API routes
    ├── test/                     # Security route tests
    ├── .env.example
    ├── app.js                    # Express application assembly
    ├── index.js                  # Environment, MongoDB, server bootstrap
    ├── SECURITY.md               # Auth deployment notes and curl examples
    ├── package.json
    └── package-lock.json
```

## Getting started

### Prerequisites

- **Node.js 22.12 or newer in the Node 22 LTS line**, with npm. Use the same Node major version locally and on Render.
- **Git** to clone the repository.
- **MongoDB Atlas account and cluster**, with a database user and network access configured for the machine running the backend.
- A terminal; commands below assume a POSIX-compatible shell such as Bash or Git Bash.

### 1. Clone the repository

```bash
git clone https://github.com/Shashank171204/Electronics-Hub.git
cd Electronics-Hub
```

### 2. Install both packages

Run from the repository root:

```bash
npm ci --prefix electronics_backend
npm ci --prefix electronics_app
```

There is no root npm workspace or root start script. Each directory has its own `package.json` and lockfile.

### 3. Configure the backend

```bash
cp electronics_backend/.env.example electronics_backend/.env
```

Edit `electronics_backend/.env`:

```dotenv
MONGO_URI=mongodb+srv://<db-user>:<url-encoded-password>@<cluster-host>/electronicsHub?retryWrites=true&w=majority
PORT=5001
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=<replace-with-a-strong-random-secret>
```

Generate a secret using Node.js, then paste the result into `JWT_SECRET`:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Replace all placeholders before starting the API. URL-encode special characters in the Atlas database password, and allow your development machine's IP in Atlas Network Access. The application requires a JWT secret of at least 32 characters at startup.

### 4. Configure the frontend

```bash
cp electronics_app/.env.example electronics_app/.env.local
```

For ordinary local development, the copied file's value is:

```dotenv
VITE_API_URL=http://localhost:5001
```

Alternatively, leave `VITE_API_URL` unset or blank to use relative `/api` requests through Vite's development proxy to `http://localhost:5001`. This is useful when viewing the frontend through a remote development preview: the browser must not call its own `localhost` to reach a backend running elsewhere. If you change the backend port, update the explicit API URL or the proxy target accordingly.

### 5. Start both servers

Open two terminals at the repository root and leave both running:

**Terminal 1 — backend**

```bash
cd electronics_backend
npm run dev
```

**Terminal 2 — frontend**

```bash
cd electronics_app
npm run dev
```

- Frontend: **http://localhost:5173** (use the URL Vite prints if that port is occupied).
- API: **http://localhost:5001**.
- Health check: **http://localhost:5001/api/health**.

The health endpoint can respond before MongoDB connects. Confirm its `db` value is `connected` before testing registration, catalog persistence, or orders. The backend reads `.env` from its working directory, so start it inside `electronics_backend` as shown above.

Register an account, log in, and browse the catalog. A new database may have no products; no seed script is included. Product writes require an admin account. Promote an account only through trusted database administration and log in again to obtain a token with the updated role—public registration cannot set roles.

## Environment variables

### Backend — `electronics_backend/.env`

| Variable | Required | Purpose / example |
| --- | --- | --- |
| `MONGO_URI` | Yes, for database-backed features | MongoDB Atlas connection string, including the database name. |
| `JWT_SECRET` | Yes | Strong random signing secret, at least 32 characters. Keep it server-side only. |
| `PORT` | Optional | Local default is `5001`. Render supplies its own port; do not hardcode a production port. |
| `CORS_ORIGINS` | Recommended | Comma-separated browser origins, e.g. `http://localhost:5173` locally or `https://electronics-hub-frontend.onrender.com` in production. Use origins only, without paths or trailing slashes. |
| `NODE_ENV` | Recommended in production | Set to `production` on Render to remove automatic localhost CORS allowances. |

The CORS configuration also always allows the repository's known production frontend origin and allows standard local Vite origins outside production. Custom frontend domains should be added to `CORS_ORIGINS`.

### Frontend — `electronics_app/.env.local`

| Variable | Required | Purpose / example |
| --- | --- | --- |
| `VITE_API_URL` | Optional, recommended for explicit deployment configuration | API origin without `/api`, e.g. `http://localhost:5001` or `https://electronics-hub.onrender.com`. |

API URL resolution in `src/lib/api.js`:

1. A non-empty `VITE_API_URL` takes precedence.
2. Development without an override uses same-origin requests and the Vite `/api` proxy.
3. Production builds without an override use `https://electronics-hub.onrender.com`.

**Vite variables are public and embedded at build time.** Restart Vite after local environment changes and rebuild/redeploy after changing a frontend variable on Render. Never place `MONGO_URI`, `JWT_SECRET`, or any other secret in a `VITE_*` variable. Local environment files are Git-ignored; commit only safe examples.

## API and authentication

| Method | Route | Access |
| --- | --- | --- |
| `GET` | `/api/health` | Public; reports process/database status |
| `POST` | `/api/user/register` | Public; accepts `name`, `email`, `pass` |
| `POST` | `/api/user/login` | Public; accepts `email`, `pass`; returns profile plus `token` |
| `GET` | `/api/product/showproducts` | Public |
| `GET` | `/api/product/search?q=phone` | Public |
| `POST` | `/api/product/createproduct` | Admin |
| `PATCH` | `/api/product/updateproduct/:id` | Admin |
| `DELETE` | `/api/product/deleteproduct/:id` | Admin |
| `POST` | `/api/order/neworder` | Authenticated owner or admin |
| `GET` | `/api/order/showorder/:email` | Authenticated owner or admin |

Protected requests use:

```http
Authorization: Bearer <token>
```

The shared Axios client attaches this header automatically. Token and profile are kept in tab-scoped `sessionStorage` and cleared on logout; passwords are not persisted. Passwords must have at least eight characters and at most 72 UTF-8 bytes.

Errors use `{ "message": "..." }`: `400` for invalid payloads, `401` for invalid credentials or missing/invalid/expired tokens, `403` for forbidden actions, and `409` for duplicate registration emails.

See [the security guide](electronics_backend/SECURITY.md) for request examples, order payload format, role changes, and token-revocation limitations. Existing plaintext-password accounts require a secure reset or controlled migration; login deliberately does not fall back to plaintext comparisons.

## Checks and builds

Run from the repository root:

```bash
# Backend route/security tests (mocked database operations; no Atlas required)
npm test --prefix electronics_backend

# Backend JavaScript syntax checks (POSIX shell required)
npm run check --prefix electronics_backend

# Frontend code quality and production bundle
npm run lint --prefix electronics_app
npm run build --prefix electronics_app
```

The frontend build is written to `electronics_app/dist`. To inspect it locally:

```bash
cd electronics_app
npm run preview
```

Vite preview normally runs on port `4173`. It serves the built assets, not the development proxy: set `VITE_API_URL=http://localhost:5001` **before building** to test a local backend, otherwise the production fallback applies. Use `npm start` inside `electronics_backend` to run the API without nodemon.

## Deployment on Render

Deploy the monorepo as two separate services connected to MongoDB Atlas. Configure Node 22 consistently for both builds/services.

### Backend — Web Service

| Setting | Value |
| --- | --- |
| Root Directory | `electronics_backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Environment | `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production` |

- Let Render inject `PORT`; the server already binds to `0.0.0.0`.
- Set `CORS_ORIGINS` to your frontend's public origin (comma-separated for multiple origins).
- Allow the backend's outbound connections in Atlas Network Access and verify the database user has appropriate permissions.
- Check Render logs for the MongoDB connection message. A healthy HTTP response alone does not guarantee a working database; inspect the health response's `db` field.
- Before deploying the unique email index, resolve duplicate emails and ensure the index exists, especially if automatic index creation is disabled in production.

### Frontend — Static Site

| Setting | Value |
| --- | --- |
| Root Directory | `electronics_app` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Environment | `VITE_API_URL=https://<your-backend-service>.onrender.com` |
| SPA rewrite | Source `/*` → Destination `/index.html`, action **Rewrite** |

The rewrite supports React Router paths such as `/orders` and `/login` on refresh. The frontend talks directly to the deployed API; Vite's development proxy is not deployed. Set `VITE_API_URL` before building and deploy again whenever it changes.

Repository-configured deployment URLs:

- Frontend: https://electronics-hub-frontend.onrender.com
- Backend: https://electronics-hub.onrender.com

For additional background, see [Render/CORS setup notes](RENDER_SETUP.md). The environment tables above include the current mandatory `JWT_SECRET` setting.

## Troubleshooting

- **API fails immediately:** Ensure `JWT_SECRET` is set to at least 32 characters in the backend environment.
- **Database requests fail:** Check Atlas credentials, password encoding, network access, and the `db` field in `/api/health`.
- **CORS or network errors:** Check the request's API URL, backend availability, and the frontend origin in `CORS_ORIGINS`. Remote-preview browsers should use the development proxy or a reachable HTTPS API URL, not a sandbox's localhost URL.
- **401 or 403 responses:** Log in again if the token has expired. Product modifications require admin status; non-admin order requests must match the authenticated email.
- **Old frontend API URL after deployment:** Update `VITE_API_URL` and trigger a new frontend build, not just a backend restart.
- **404 when refreshing a frontend route:** Add the Render SPA rewrite shown above.
- **Empty catalog:** Populate products through the admin-protected API; the repository does not include an automatic production seed process.

## Built with the open-source MongoDB, Express, React, Node.js, Vite, Tailwind CSS, and Framer Motion ecosystems, with deployment infrastructure from Render.

## License

The backend package currently declares `ISC` in its `package.json`. There is no root `LICENSE` file defining repository-wide terms; add one before presenting the entire repository under a specific license.
