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

The app reads `VITE_API_URL` from your `.env`:

- **With `VITE_API_URL` set** → all calls go to that origin (your real backend). Nothing changes from the original wiring.
- **Without it** → calls go same-origin to `/api/*` and are proxied to `http://localhost:5001` by Vite (see `vite.config.js`) — that's where the mock API runs, so the UI is fully explorable without MongoDB.

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
