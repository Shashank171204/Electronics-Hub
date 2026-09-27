# Electronics Hub — Frontend

Modern, animated storefront for the Electronics-Hub MERN app.
Built with **React 19 + Vite + Tailwind CSS v4 + Framer Motion + lucide-react + react-hot-toast**.

## Design system

- Sleek **dark theme** with glassmorphism surfaces (`glass` utility) and a cyan → violet accent duo
- Typography: **Space Grotesk** (display headings) + **Inter** (body/UI)
- Consistent `rounded-xl` / `rounded-2xl` radii, 4px spacing scale, responsive from mobile → desktop
- All animation logic lives in [`src/components/ui/motionVariants.js`](src/components/ui/motionVariants.js):
  page transitions (fade + slide-up), `staggerChildren` list cascades, and tactile
  `whileHover` (scale 1.02) / `whileTap` (scale 0.95) states

## Getting started

```bash
npm install
npm run dev
```

### API URL

Every request goes through one shared axios client, [`src/lib/api.js`](src/lib/api.js), which resolves the backend origin by itself:

| Situation | Base URL | Decided by |
| --- | --- | --- |
| `npm run dev` | `http://localhost:5001` | `import.meta.env.DEV` |
| `npm run build` (Render deploy) | `https://electronics-hub.onrender.com` | production fallback |
| explicit override, any mode | `VITE_API_URL` | wins over both |

```bash
# .env.local — git-ignored, only needed to point at a different backend
VITE_API_URL=http://localhost:5001
```

Vite inlines `VITE_*` variables at **build time**, so on Render the variable has
to be present as a *Build & environment* variable and the service must be
redeployed after you change it. A runtime-only variable does nothing. Full
walkthrough: [../RENDER_SETUP.md](../RENDER_SETUP.md).

Components no longer build URL strings by hand — they use the client with
root-relative paths, so there is exactly one place that knows the host:

```jsx
import api, { endpoints } from "../lib/api";

const { data } = await api.get(endpoints.products); // GET <base>/api/product/showproducts
await api.post(endpoints.newOrder, order); //        POST <base>/api/order/neworder
```

`describeApiError(err)` turns a failure into toast copy that distinguishes
"the API is unreachable / CORS blocked it" from "401 Invalid credentials" —
the two need completely different fixes.

`vite.config.js` still proxies `/api` → `:5001`. That is only used if you make
`resolveApiBaseUrl()` return `""` in dev; the current setup calls `:5001`
directly, which works because the backend allowlists `http://localhost:5173`.


### Mock API (no MongoDB required)

```bash
node mock/server.mjs   # in-memory, same endpoints/shapes as the real backend, on :5001
```

Demo login: `demo@hub.com` / `demo123`

## Project structure

```
src/
├── App.jsx            # context provider, routes, page transitions, toaster
├── index.css          # Tailwind v4 design system (tokens, glass/shimmer utilities)
├── lib/
│   └── api.js         # the ONLY place the API origin is decided (dev vs prod) + shared axios client + endpoints
├── components/
│   ├── Header.jsx     # sticky glass nav, sliding active pill, animated cart badge, mobile menu
│   ├── Products.jsx   # staggered product grid, skeleton loaders, empty state + retry
│   ├── Cart.jsx       # animated cart rows (layout reflow), sticky order summary
│   ├── Orders.jsx     # order history with skeletons / empty / logged-out states
│   ├── Login.jsx      # glass form, inline animated errors, password toggle
│   ├── Register.jsx   # glass form + client-side validation
│   ├── Footer.jsx     # slim glass footer with quick links
│   └── ui/            # reusable primitives:
│       ├── Page.jsx           # page-transition wrapper (AnimatePresence-compatible)
│       ├── motionVariants.js  # shared variants (EASE, staggerContainer, fadeUpItem…)
│       ├── Button.jsx         # tactile button with variants + loading spinner
│       ├── Field.jsx          # glass input with icon + focus ring
│       ├── EmptyState.jsx     # glowing icon + copy + action
│       ├── Skeleton.jsx       # shimmer placeholders (product card, order row)
│       └── QuantityStepper.jsx# +/− stepper with springy count pop
mock/
└── server.mjs         # zero-dependency in-memory API mock (see above)
```

## What changed in the UI overhaul

- `alert()` / plain-text errors → themed **react-hot-toast** notifications
- Loading text → **shimmer skeleton loaders** + animated button spinners
- No-result queries → designed **empty states** with icon, copy and an action
- Emoji → **lucide-react** icons
- Page transitions (fade + slide-up), staggered list entrances, tactile hover/tap
- **All backend endpoints, request payload shapes and context state are unchanged**
  (paths and bodies are identical; only *how* the base URL is resolved moved into `src/lib/api.js`)
