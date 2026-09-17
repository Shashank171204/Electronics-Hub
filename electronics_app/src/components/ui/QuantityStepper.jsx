import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

/**
 * Quantity stepper shared by the product grid and the cart.
 * Buttons have a snappy whileTap "press" (scale 0.85) and the count
 * re-keys on every change so the number pops with a spring.
 */
export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const btn =
    "grid place-items-center rounded-full bg-white/[0.06] text-slate-200 transition-colors hover:bg-cyan-400/20 hover:text-white";
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className={`${btn} ${dim}`}
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      {/* key={quantity} remounts the span on change → the count "pops" */}
      <motion.span
        key={quantity}
        initial={{ scale: 1.35, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="min-w-7 text-center text-sm font-bold tabular-nums text-white"
      >
        {quantity}
      </motion.span>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={`${btn} ${dim}`}
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
