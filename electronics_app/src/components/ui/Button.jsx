import { motion } from "framer-motion";

const VARIANTS = {
  // Gradient primary CTA
  primary:
    "btn-gradient text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-400/30",
  // Subtle glass secondary
  glass:
    "border border-white/10 bg-white/[0.05] text-slate-200 backdrop-blur-md hover:bg-white/[0.1] hover:text-white",
  // Soft red destructive
  danger:
    "border border-rose-400/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200",
};

/**
 * Tactile button — springs to 1.02 on hover and 0.95 on tap (the exact
 * micro-interaction values requested: whileHover scale 1.02 / whileTap 0.95).
 * Shows an inline spinner while `loading` and disables pointer events.
 */
export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}) {
  const blocked = disabled || loading;
  return (
    <motion.button
      // No hover/tap scaling while disabled so the button doesn't "jump"
      whileHover={blocked ? undefined : { scale: 1.02 }}
      whileTap={blocked ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      disabled={blocked}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-shadow duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        // Custom animated spinner (pure CSS, matches button color)
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </motion.button>
  );
}
