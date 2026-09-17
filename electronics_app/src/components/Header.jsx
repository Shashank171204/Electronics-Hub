import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { appContext } from "../appContext";

/* Nav items — clean lucide icons replace the old emoji */
const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Header() {
  const { user, cart, products, setUser } = useContext(appContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu state

  // Distinct products currently in the cart → badge count (same rule as before)
  const items = products.filter((value) => (cart[value._id] ?? 0) > 0);
  const isLoggedIn = Boolean(user.email);

  /* The original "Logout" just linked to /login (its setUser() call was
     commented out). Now it actually clears the session — same fields as the
     author's commented intent — then redirects home. */
  const handleLogout = () => {
    setUser({ name: "", email: "", pass: "" });
    setMenuOpen(false);
    navigate("/");
    toast("Signed out. See you soon!", { icon: "👋" });
  };

  return (
    /* Entrance: header slides down + fades in once on mount.
       sticky + translucent night bg + backdrop-blur = the glassy top bar. */
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/[0.07] bg-night-950/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand — gradient logo tile + display font, subtle hover spin */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
            <Cpu className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Electronics<span className="text-gradient">Hub</span>
          </span>
        </Link>

        {/* Desktop nav — the active item carries a shared-layout pill
            (layoutId) that slides between items on navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-400 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.08]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {/* Cart — animated count badge re-pops whenever the count changes */}
          <Link
            to="/cart"
            aria-label={`Cart, ${items.length} items`}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {items.length > 0 && (
                <motion.span
                  key={items.length}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 px-1 text-[10px] font-bold text-white shadow-md shadow-cyan-500/30"
                >
                  {items.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Login / Logout — tactile press states */}
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleLogout}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate("/login")}
              className="btn-gradient flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </motion.button>
          )}

          {/* Mobile menu toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile nav — height + opacity slide, links close it on tap */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                      isActive
                        ? "border border-white/10 bg-white/[0.08] text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
