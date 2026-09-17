import { Link } from "react-router-dom";
import { Cpu } from "lucide-react";

/**
 * Footer — slim glass strip: brand on the left, quick links in the middle,
 * dynamic copyright on the right. Stacks vertically on mobile.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-white/[0.07] bg-white/[0.02]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500">
            <Cpu className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-sm font-semibold text-white">
            Electronics<span className="text-gradient">Hub</span>
          </span>
        </div>

        {/* Quick links */}
        <nav className="flex items-center gap-5 text-sm text-slate-400">
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <Link to="/cart" className="transition-colors hover:text-white">
            Cart
          </Link>
          <Link to="/orders" className="transition-colors hover:text-white">
            Orders
          </Link>
        </nav>

        <p className="text-xs text-slate-500">
          © {year} Electronics Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
